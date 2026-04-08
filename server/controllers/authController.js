// controllers/authController.js
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import EmailToken from "../models/EmailToken.js";
import Session from "../models/Session.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MODEL_MAP = {
  jobseeker: { Model: Jobnode, name: "Jobnode" },
  handyman: { Model: Handyman, name: "Handyman" },
  employer: { Model: Employer, name: "Employer" },
};

const emailExistsAnywhere = async (email) => {
  const [j, h, e] = await Promise.all([
    Jobnode.findOne({ email }).lean(),
    Handyman.findOne({ email }).lean(),
    Employer.findOne({ email }).lean(),
  ]);
  return Boolean(j || h || e);
};

const findUserByEmail = async (email) => {
  const jobseeker = await Jobnode.findOne({ email });
  if (jobseeker) return { user: jobseeker, modelName: "Jobnode" };
  const handyman = await Handyman.findOne({ email });
  if (handyman) return { user: handyman, modelName: "Handyman" };
  const employer = await Employer.findOne({ email });
  if (employer) return { user: employer, modelName: "Employer" };
  return { user: null, modelName: null };
};

const findUserById = async (id, role) => {
  const entry = MODEL_MAP[role];
  if (!entry) return null;
  return entry.Model.findById(id).lean();
};

const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Parse UA string into a friendly label
function parseDevice(userAgent = "") {
  const ua = userAgent.toLowerCase();
  let browser = "Unknown browser";
  let device = "Unknown device";

  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  if (ua.includes("iphone")) device = "iPhone";
  else if (ua.includes("ipad")) device = "iPad";
  else if (ua.includes("android")) device = "Android";
  else if (ua.includes("windows")) device = "Windows PC";
  else if (ua.includes("mac")) device = "Mac";
  else if (ua.includes("linux")) device = "Linux";

  return { browser, device };
}

// Issue JWT + httpOnly cookie + record session
const issueToken = async (res, user, modelName, req) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Store a SHA-256 hash of the token (never the raw token) so we can
  // list/revoke sessions without exposing full JWTs in the DB.
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const ua = req?.headers?.["user-agent"] || "";
  const ip =
    req?.headers?.["x-forwarded-for"]?.split(",")[0].trim() || req?.ip || "";
  const { browser, device } = parseDevice(ua);

  await Session.create({
    userId: user._id,
    userModel: modelName,
    tokenHash,
    userAgent: ua,
    ip,
    browser,
    device,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
};

// Generate a secure random hex token
const makeSecureToken = () => crypto.randomBytes(32).toString("hex");

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export const signup2 = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      password,
      skills,
      location,
      companyName,
      companyWebsite,
    } = req.body;

    if (!role || !MODEL_MAP[role]) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    if (await emailExistsAnywhere(email.toLowerCase())) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 12);
    let created;
    const { name: modelName } = MODEL_MAP[role];

    if (role === "jobseeker") {
      created = await Jobnode.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: "jobseeker",
        emailVerified: false,
      });
    } else if (role === "handyman") {
      const skillsArr =
        typeof skills === "string"
          ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(skills)
            ? skills
            : [];
      created = await Handyman.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: "handyman",
        skills: skillsArr,
        location: location || "",
        emailVerified: false,
      });
    } else if (role === "employer") {
      created = await Employer.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: "employer",
        companyName: companyName || "",
        companyWebsite: companyWebsite || "",
        emailVerified: false,
      });
    }

    // Send verification email (fire-and-forget — don't block signup)
    const verifyToken = makeSecureToken();
    await EmailToken.create({
      userId: created._id,
      userModel: modelName,
      token: verifyToken,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    sendVerificationEmail(created.email, verifyToken).catch((err) =>
      console.error("❌ Verification email failed:", err.message),
    );

    // Still issue token and log in — user can use the app but sees a banner
    await issueToken(res, created, modelName, req);

    return res.status(201).json({
      message:
        "Signup successful. Please check your email to verify your account.",
      user: sanitize(created),
      emailVerificationSent: true,
    });
  } catch (err) {
    console.error("❌ signup2 error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { user, modelName } = await findUserByEmail(
      email.toLowerCase().trim(),
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.banned) {
      return res
        .status(403)
        .json({ message: "This account has been suspended. Contact support." });
    }

    await issueToken(res, user, modelName, req);

    return res.status(200).json({
      message: "Login successful",
      user: sanitize(user),
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    // Revoke the current session
    const token = req.cookies?.token;
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await Session.findOneAndUpdate({ tokenHash }, { revoked: true });
    }
  } catch {}

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    const user = await findUserById(id, role);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user: sanitize(user) });
  } catch (err) {
    console.error("❌ getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMAIL VERIFICATION ───────────────────────────────────────────────────────

// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { name: modelName, Model } = MODEL_MAP[role];
    const user = await Model.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Delete any existing verification tokens for this user
    await EmailToken.deleteMany({ userId: id, type: "email_verification" });

    const token = makeSecureToken();
    await EmailToken.create({
      userId: id,
      userModel: modelName,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, token);
    res.json({ message: "Verification email sent. Check your inbox." });
  } catch (err) {
    console.error("❌ resendVerification error:", err);
    res.status(500).json({ message: "Failed to send verification email" });
  }
};

// GET /api/auth/verify-email?token=xxx
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const record = await EmailToken.findOne({
      token,
      type: "email_verification",
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });
    }
    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res
        .status(400)
        .json({ message: "Verification link has expired. Request a new one." });
    }

    const { Model } =
      MODEL_MAP[
        { Jobnode: "jobseeker", Handyman: "handyman", Employer: "employer" }[
          record.userModel
        ]
      ];
    await Model.findByIdAndUpdate(record.userId, { emailVerified: true });
    await record.deleteOne();

    res.json({
      message: "Email verified successfully. Your account is now fully active.",
    });
  } catch (err) {
    console.error("❌ verifyEmail error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ─── PASSWORD RESET ───────────────────────────────────────────────────────────

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const { user, modelName } = await findUserByEmail(
      email.toLowerCase().trim(),
    );

    // Always respond with same message to prevent email enumeration
    const genericMsg =
      "If that email is registered, you'll receive a reset link shortly.";

    if (!user) return res.json({ message: genericMsg });

    // Delete any existing reset tokens
    await EmailToken.deleteMany({ userId: user._id, type: "password_reset" });

    const token = makeSecureToken();
    await EmailToken.create({
      userId: user._id,
      userModel: modelName,
      token,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    });

    await sendPasswordResetEmail(user.email, token);
    res.json({ message: genericMsg });
  } catch (err) {
    console.error("❌ forgotPassword error:", err);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const record = await EmailToken.findOne({ token, type: "password_reset" });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res
        .status(400)
        .json({ message: "Reset link has expired. Request a new one." });
    }

    const roleByModel = {
      Jobnode: "jobseeker",
      Handyman: "handyman",
      Employer: "employer",
    };
    const { Model } = MODEL_MAP[roleByModel[record.userModel]];

    const hashed = await bcrypt.hash(password, 12);
    await Model.findByIdAndUpdate(record.userId, { password: hashed });

    // Revoke ALL sessions for this user (forces re-login everywhere)
    await Session.updateMany({ userId: record.userId }, { revoked: true });

    await record.deleteOne();

    // Clear the cookie if they happen to have one
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// ─── SESSION MANAGEMENT ───────────────────────────────────────────────────────

// GET /api/auth/sessions
export const getSessions = async (req, res) => {
  try {
    const { id } = req.user;
    const currentTokenHash = req.cookies?.token
      ? crypto.createHash("sha256").update(req.cookies.token).digest("hex")
      : null;

    const sessions = await Session.find({
      userId: id,
      revoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastSeenAt: -1 })
      .lean();

    const formatted = sessions.map((s) => ({
      id: s._id,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      isCurrent: s.tokenHash === currentTokenHash,
    }));

    res.json({ sessions: formatted });
  } catch (err) {
    console.error("❌ getSessions error:", err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

// DELETE /api/auth/sessions/:sessionId  — revoke a specific session
export const revokeSession = async (req, res) => {
  try {
    const { id } = req.user;
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await session.updateOne({ revoked: true });
    res.json({ message: "Session revoked" });
  } catch (err) {
    console.error("❌ revokeSession error:", err);
    res.status(500).json({ message: "Failed to revoke session" });
  }
};

// DELETE /api/auth/sessions  — revoke all OTHER sessions (keep current)
export const revokeAllOtherSessions = async (req, res) => {
  try {
    const { id } = req.user;
    const currentTokenHash = req.cookies?.token
      ? crypto.createHash("sha256").update(req.cookies.token).digest("hex")
      : null;

    await Session.updateMany(
      { userId: id, tokenHash: { $ne: currentTokenHash }, revoked: false },
      { revoked: true },
    );

    res.json({ message: "All other sessions revoked" });
  } catch (err) {
    console.error("❌ revokeAllOtherSessions error:", err);
    res.status(500).json({ message: "Failed to revoke sessions" });
  }
};

// ─── ACCOUNT DELETION (NDPA compliance) ──────────────────────────────────────

// DELETE /api/auth/account
export const deleteAccount = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete your account" });
    }

    const { Model } = MODEL_MAP[role];
    const user = await Model.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password. Account not deleted." });
    }

    // Revoke all sessions
    await Session.deleteMany({ userId: id });

    // Delete all email tokens
    await EmailToken.deleteMany({ userId: id });

    // Delete the user
    await user.deleteOne();

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      message: "Account deleted successfully. We're sorry to see you go.",
    });
  } catch (err) {
    console.error("❌ deleteAccount error:", err);
    res.status(500).json({ message: "Account deletion failed" });
  }
};
