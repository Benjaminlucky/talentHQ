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
      amount: amountNGN * 100, // convert NGN to kobo
      reference,
      metadata,
      callback_url:
        callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`,
    },
    { headers: paystackHeaders() },
  );
  return res.data.data; // { authorization_url, access_code, reference }
}

// ── POST /api/payments/subscription/initialize ────────────────────────────────
// Employer or jobseeker initiates a plan upgrade
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
    const callbackUrl = `${process.env.FRONTEND_URL}/payment/callback?type=subscription&planId=${planId}&interval=${interval}`;

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
// Anyone initializes an ad placement payment
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

    // Pricing matrix: zone × duration
    const ZONE_PRICES = {
      sidebar: 500, // ₦500/day
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

    // Create ad record in pending_payment state
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
// Employer boosts a specific job listing
export const initializeJobBoost = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can boost jobs" });
    }
    const { jobId, durationDays = 7, featured = false } = req.body;

    const job = await JobModel.findOne({
      _id: jobId,
      company: { $exists: true },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Pricing: boost ₦2,000 / 7 days; featured ₦5,000 / 7 days
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
// Paystack calls this after every successful payment — MUST be public (no auth middleware)
export const paystackWebhook = async (req, res) => {
  // Verify signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const { event, data } = req.body;

  // Acknowledge immediately — Paystack will retry if we don't respond fast
  res.sendStatus(200);

  if (event !== "charge.success") return;

  const { reference, metadata, amount } = data;
  const type = metadata?.type;

  try {
    if (type === "subscription") {
      const { userId, userModel, planId, planName, interval } = metadata;
      const plan = await Plan.findById(planId);
      const durationMs = interval === "yearly" ? 365 * 86400000 : 30 * 86400000;

      // Cancel any existing active subscription
      await Subscription.updateMany(
        { userId, status: "active" },
        { status: "cancelled" },
      );

      await Subscription.create({
        userId,
        userModel,
        planId,
        planName,
        paystackRef: reference,
        interval,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + durationMs),
        status: "active",
      });

      // Store plan on the user doc for fast middleware checks
      const UserModel = userModel === "Employer" ? Employer : Jobnode;
      await UserModel.findByIdAndUpdate(userId, {
        activePlan: planName,
        planExpiresAt: new Date(Date.now() + durationMs),
      });
    }

    if (type === "ad") {
      const { adId } = metadata;
      const ad = await Ad.findById(adId);
      if (ad) {
        const now = new Date();
        ad.status = "pending_review"; // admin reviews before going live
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
// Client-side callback verification
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const paystackRes = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: paystackHeaders() },
    );
    const tx = paystackRes.data.data;
    if (tx.status !== "success") {
      return res
        .status(400)
        .json({ message: "Payment not successful", status: tx.status });
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
export const getMySubscription = async (req, res) => {
  try {
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
// Returns active ads for a given zone — public
export const getActiveAds = async (req, res) => {
  try {
    const { zone } = req.query;
    const query = {
      status: "active",
      expiresAt: { $gt: new Date() },
    };
    if (zone) query.zone = zone;

    const ads = await Ad.find(query).sort({ createdAt: -1 }).limit(5).lean();
    // Track impressions fire-and-forget
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
