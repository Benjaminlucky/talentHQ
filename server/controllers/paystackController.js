// controllers/paystackController.js
import crypto from "crypto";
import axios from "axios";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import Ad from "../models/Ad.js";
import JobModel from "../models/job.model.js";
import Employer from "../models/Employer.js";
import Jobnode from "../models/Jobnode.js";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = "https://api.paystack.co";

const paystackHeaders = () => ({
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  "Content-Type": "application/json",
});

// ── Helper: initialize a Paystack transaction ─────────────────────────────────
async function initializePaystack({
  email,
  amountNGN,
  reference,
  metadata,
  callbackUrl,
}) {
  const res = await axios.post(
    `${PAYSTACK_BASE}/transaction/initialize`,
    {
      email,
      amount: amountNGN * 100, // NGN to kobo
      reference,
      metadata,
      callback_url:
        callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`,
    },
    { headers: paystackHeaders() },
  );
  return res.data.data;
}

// ── Helper: activate subscription in DB ───────────────────────────────────────
// Shared by webhook AND verifyPayment — both paths produce identical results.
// This eliminates the race condition where webhook fires after the user lands
// on the callback page but the plan was never activated.
async function activateSubscription({
  userId,
  userModel,
  planId,
  planName,
  interval,
  paystackRef,
}) {
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error(`Plan ${planId} not found`);

  const durationMs = interval === "yearly" ? 365 * 86400000 : 30 * 86400000;
  const expiresAt = new Date(Date.now() + durationMs);

  // Cancel any existing active subscription for this user first
  await Subscription.updateMany(
    { userId, status: "active" },
    { status: "cancelled" },
  );

  await Subscription.create({
    userId,
    userModel,
    planId,
    planName,
    paystackRef,
    interval,
    startedAt: new Date(),
    expiresAt,
    status: "active",
  });

  // Store plan name on user doc for fast plan checks
  const UserModel = userModel === "Employer" ? Employer : Jobnode;
  await UserModel.findByIdAndUpdate(userId, {
    activePlan: planName,
    planExpiresAt: expiresAt,
  });

  return { plan, expiresAt };
}

// ── POST /api/payments/subscription/initialize ────────────────────────────────
export const initializeSubscription = async (req, res) => {
  try {
    const { planId, interval = "monthly" } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (plan.priceMonthly === 0)
      return res.status(400).json({ message: "Free plan requires no payment" });

    const userModel = req.user.role === "employer" ? "Employer" : "Jobnode";
    const UserDoc = req.user.role === "employer" ? Employer : Jobnode;
    const user = await UserDoc.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const amountNGN =
      interval === "yearly" ? plan.priceYearly / 100 : plan.priceMonthly / 100;
    const reference = `sub_${req.user.id}_${Date.now()}`;

    // Pass userRole in callback URL so the callback page redirects correctly
    const callbackUrl =
      `${process.env.FRONTEND_URL}/payment/callback` +
      `?type=subscription&planId=${planId}&interval=${interval}&userRole=${req.user.role}`;

    const payment = await initializePaystack({
      email: user.email || user.companyEmail,
      amountNGN,
      reference,
      metadata: {
        type: "subscription",
        userId: req.user.id.toString(),
        userModel,
        planId: planId.toString(),
        planName: plan.name,
        interval,
      },
      callbackUrl,
    });

    res.json({ authorizationUrl: payment.authorization_url, reference });
  } catch (err) {
    console.error(
      "❌ initializeSubscription:",
      err.response?.data || err.message,
    );
    res.status(500).json({ message: "Failed to initialize payment" });
  }
};

// ── POST /api/payments/ad/initialize ─────────────────────────────────────────
export const initializeAdPayment = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      ctaText,
      zone,
      durationDays,
    } = req.body;

    if (!title || !description || !linkUrl || !zone || !durationDays) {
      return res.status(400).json({
        message:
          "title, description, linkUrl, zone and durationDays are required",
      });
    }

    const ZONE_PRICES = {
      sidebar: 500,
      feed_inline: 800,
      feed_top: 1200,
      findjob_banner: 2000,
    };
    const dailyRate = ZONE_PRICES[zone] || 500;
    const priceTotal = dailyRate * Number(durationDays);

    const userModel =
      req.user.role === "employer"
        ? "Employer"
        : req.user.role === "handyman"
          ? "Handyman"
          : "Jobnode";

    const UserDoc = req.user.role === "employer" ? Employer : Jobnode;
    const user = await UserDoc.findById(req.user.id).lean();
    const reference = `ad_${req.user.id}_${Date.now()}`;

    const ad = await Ad.create({
      placedBy: req.user.id,
      placedByModel: userModel,
      title,
      description,
      imageUrl: imageUrl || "",
      linkUrl,
      ctaText: ctaText || "Learn More",
      zone,
      durationDays: Number(durationDays),
      priceTotal,
      paystackRef: reference,
      status: "pending_payment",
    });

    const payment = await initializePaystack({
      email: user.email || user.companyEmail,
      amountNGN: priceTotal,
      reference,
      metadata: { type: "ad", adId: ad._id.toString() },
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback?type=ad`,
    });

    res.json({
      authorizationUrl: payment.authorization_url,
      reference,
      adId: ad._id,
      priceTotal,
    });
  } catch (err) {
    console.error("❌ initializeAdPayment:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to initialize ad payment" });
  }
};

// ── POST /api/payments/boost/initialize ──────────────────────────────────────
export const initializeJobBoost = async (req, res) => {
  try {
    if (req.user.role !== "employer")
      return res.status(403).json({ message: "Only employers can boost jobs" });

    const { jobId, durationDays = 7, featured = false } = req.body;
    const job = await JobModel.findOne({
      _id: jobId,
      company: { $exists: true },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const BASE_PRICE = featured ? 5000 : 2000;
    const amountNGN = Math.round(BASE_PRICE * (Number(durationDays) / 7));
    const employer = await Employer.findById(req.user.id).lean();
    const reference = `boost_${jobId}_${Date.now()}`;

    const payment = await initializePaystack({
      email: employer.email || employer.companyEmail,
      amountNGN,
      reference,
      metadata: {
        type: "boost",
        jobId: jobId.toString(),
        durationDays,
        featured,
      },
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback?type=boost`,
    });

    res.json({
      authorizationUrl: payment.authorization_url,
      reference,
      amountNGN,
    });
  } catch (err) {
    console.error("❌ initializeJobBoost:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to initialize boost payment" });
  }
};

// ── POST /api/payments/webhook ────────────────────────────────────────────────
export const paystackWebhook = async (req, res) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"])
    return res.status(400).json({ message: "Invalid signature" });

  const { event, data } = req.body;

  // Acknowledge immediately — Paystack retries if we don't respond fast enough
  res.sendStatus(200);

  if (event !== "charge.success") return;

  const { reference, metadata } = data;
  const type = metadata?.type;

  try {
    if (type === "subscription") {
      const { userId, userModel, planId, planName, interval } = metadata;
      // Guard: skip if verifyPayment already activated this reference
      const existing = await Subscription.findOne({
        paystackRef: reference,
        status: "active",
      });
      if (!existing) {
        await activateSubscription({
          userId,
          userModel,
          planId,
          planName,
          interval,
          paystackRef: reference,
        });
        console.log(
          `✅ Webhook activated subscription for ${userId} → ${planName}`,
        );
      }
    }

    if (type === "ad") {
      const { adId } = metadata;
      const ad = await Ad.findById(adId);
      if (ad && ad.status === "pending_payment") {
        const now = new Date();
        ad.status = "pending_review";
        ad.startsAt = now;
        ad.expiresAt = new Date(now.getTime() + ad.durationDays * 86400000);
        await ad.save();
      }
    }

    if (type === "boost") {
      const { jobId, durationDays, featured } = metadata;
      const expiresAt = new Date(Date.now() + Number(durationDays) * 86400000);
      const updates = {
        boosted: true,
        boostExpiresAt: expiresAt,
        boostPaystackRef: reference,
      };
      if (featured) {
        updates.featured = true;
        updates.featuredExpiresAt = expiresAt;
      }
      await JobModel.findByIdAndUpdate(jobId, updates);
    }
  } catch (err) {
    console.error("❌ webhook processing error (non-fatal):", err.message);
  }
};

// ── GET /api/payments/verify/:reference ──────────────────────────────────────
// FIX: Now activates the subscription if the webhook hasn't fired yet.
// This makes payment reliable even when Paystack webhook delivery is delayed.
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackRes = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: paystackHeaders() },
    );
    const tx = paystackRes.data.data;

    if (tx.status !== "success")
      return res
        .status(400)
        .json({ message: "Payment not successful", status: tx.status });

    const { metadata } = tx;
    const type = metadata?.type;

    // Activate subscription if webhook hasn't done it yet
    if (type === "subscription") {
      const { userId, userModel, planId, planName, interval } = metadata;
      const existing = await Subscription.findOne({
        paystackRef: reference,
        status: "active",
      });
      if (!existing) {
        await activateSubscription({
          userId,
          userModel,
          planId,
          planName,
          interval,
          paystackRef: reference,
        });
        console.log(
          `✅ verifyPayment activated subscription for ${userId} → ${planName}`,
        );
      }
    }

    // Activate ad if webhook hasn't done it yet
    if (type === "ad") {
      const { adId } = metadata;
      const ad = await Ad.findById(adId);
      if (ad && ad.status === "pending_payment") {
        const now = new Date();
        ad.status = "pending_review";
        ad.startsAt = now;
        ad.expiresAt = new Date(now.getTime() + ad.durationDays * 86400000);
        await ad.save();
      }
    }

    // Activate boost if webhook hasn't done it yet
    if (type === "boost") {
      const { jobId, durationDays, featured } = metadata;
      const job = await JobModel.findById(jobId);
      if (job && !job.boosted) {
        const expiresAt = new Date(
          Date.now() + Number(durationDays) * 86400000,
        );
        const updates = {
          boosted: true,
          boostExpiresAt: expiresAt,
          boostPaystackRef: reference,
        };
        if (featured) {
          updates.featured = true;
          updates.featuredExpiresAt = expiresAt;
        }
        await JobModel.findByIdAndUpdate(jobId, updates);
      }
    }

    res.json({
      message: "Payment verified",
      metadata: tx.metadata,
      amountPaid: tx.amount / 100,
    });
  } catch (err) {
    console.error("❌ verifyPayment:", err.response?.data || err.message);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ── GET /api/payments/plans ───────────────────────────────────────────────────
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true })
      .sort({ sortOrder: 1 })
      .lean();
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

// ── GET /api/payments/subscription ───────────────────────────────────────────
// FIX: Auto-expires overdue subscriptions so stale active plans don't persist.
export const getMySubscription = async (req, res) => {
  try {
    // Expire any subscriptions past their expiresAt
    await Subscription.updateMany(
      { userId: req.user.id, status: "active", expiresAt: { $lt: new Date() } },
      { status: "expired" },
    );

    // Reset activePlan on user doc if their plan has lapsed
    const UserModel = req.user.role === "employer" ? Employer : Jobnode;
    const user = await UserModel.findById(req.user.id).lean();
    if (user?.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
      const defaultPlan =
        req.user.role === "employer" ? "employer_free" : "jobseeker_free";
      await UserModel.findByIdAndUpdate(req.user.id, {
        activePlan: defaultPlan,
        planExpiresAt: null,
      });
    }

    const sub = await Subscription.findOne({
      userId: req.user.id,
      status: "active",
    })
      .populate("planId")
      .lean();

    res.json({ subscription: sub || null });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
};

// ── GET /api/payments/ads/active ─────────────────────────────────────────────
export const getActiveAds = async (req, res) => {
  try {
    const { zone } = req.query;
    const query = { status: "active", expiresAt: { $gt: new Date() } };
    if (zone) query.zone = zone;

    const ads = await Ad.find(query).sort({ createdAt: -1 }).limit(5).lean();
    if (ads.length) {
      Ad.updateMany(
        { _id: { $in: ads.map((a) => a._id) } },
        { $inc: { impressions: 1 } },
      ).catch(() => {});
    }
    res.json({ ads });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ads" });
  }
};

// ── POST /api/payments/ads/:id/click ─────────────────────────────────────────
export const trackAdClick = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
};
