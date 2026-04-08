// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountDeletedEmail,
} from "../utils/email.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const emailExistsAnywhere = async (email) => {
  const norm = email.toLowerCase().trim();
  const [j, h, e] = await Promise.all([
    Jobnode.findOne({ email: norm }).lean(),
    Handyman.findOne({ email: norm }).lean(),
    Employer.findOne({ email: norm }).lean(),
  ]);
  return Boolean(j || h || e);
};

const findUserByEmail = async (email) => {
  const norm = email.toLowerCase().trim();
  return (
    (await Jobnode.findOne({ email: norm })) ||
    (await Handyman.findOne({ email: norm })) ||
    (await Employer.findOne({ email: norm }))
  );
};

const findUserById = async (id, role) => {
  switch (role) {
    case "jobseeker":
      return await Jobnode.findById(id).lean();
    case "handyman":
      return await Handyman.findById(id).lean();
    case "employer":
      return await Employer.findById(id).lean();
    default:
      return null;
  }
};

const findUserDocById = async (id, role) => {
  switch (role) {
    case "jobseeker":
      return await Jobnode.findById(id);
    case "handyman":
      return await Handyman.findById(id);
    case "employer":
      return await Employer.findById(id);
    default:
      return null;
  }
};

const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

const issueToken = (res, user) => {
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
  return token;
};

// Generate a secure random hex token
const makeToken = () => crypto.randomBytes(32).toString("hex");

// ── POST /api/auth/signup2 ────────────────────────────────────────────────────
// Creates account + sends verification email. Does NOT issue a session token
// until email is verified.
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

    if (!role || !["jobseeker", "handyman", "employer"].includes(role)) {
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
    if (await emailExistsAnywhere(email)) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = makeToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const commonFields = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      emailVerified: false,
    };

    let created;
    if (role === "jobseeker") {
      created = await Jobnode.create({ ...commonFields, role: "jobseeker" });
    } else if (role === "handyman") {
      const skillsArr = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
          ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      created = await Handyman.create({
        ...commonFields,
        role: "handyman",
        skills: skillsArr,
        location: location || "",
      });
    } else {
      created = await Employer.create({
        ...commonFields,
        role: "employer",
        companyName: companyName || "",
        companyWebsite: companyWebsite || "",
      });
    }

    // Send verification email (non-blocking — log error but don't fail signup)
    try {
      await sendVerificationEmail(
        created.email,
        created.fullName,
        verificationToken,
      );
    } catch (emailErr) {
      console.error("⚠️  Verification email failed to send:", emailErr.message);
    }

    return res.status(201).json({
      message:
        "Account created! Please check your email to verify your account before logging in.",
      requiresVerification: true,
    });
  } catch (err) {
    console.error("❌ signup2 error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// ── GET /api/auth/verify-email?token=xxx ─────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res
        .status(400)
        .json({ message: "Verification token is required" });

    // Search across all user collections
    const models = [Jobnode, Handyman, Employer];
    let user = null;

    for (const Model of models) {
      user = await Model.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      });
      if (user) break;
    }

    if (!user) {
      return res.status(400).json({
        message:
          "This verification link is invalid or has expired. Please request a new one.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Issue session so user lands directly on their dashboard
    issueToken(res, user);

    return res.status(200).json({
      message: "Email verified successfully! Welcome to TalentHQ.",
      user: sanitize(user),
    });
  } catch (err) {
    console.error("❌ verifyEmail error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ── POST /api/auth/resend-verification ───────────────────────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await findUserByEmail(email);

    // Always return 200 to prevent email enumeration
    if (!user || user.emailVerified) {
      return res.status(200).json({
        message:
          "If that email exists and is unverified, we've sent a new link.",
      });
    }

    const token = makeToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.fullName, token);

    return res
      .status(200)
      .json({ message: "A new verification email has been sent." });
  } catch (err) {
    console.error("❌ resendVerification error:", err);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.banned) {
      return res.status(403).json({
        message: "Your account has been suspended. Contact support@talenthq.ng",
      });
    }

    // Block login until email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in. Check your inbox or request a new link.",
        requiresVerification: true,
        email: user.email,
      });
    }

    issueToken(res, user);
    return res
      .status(200)
      .json({ message: "Login successful", user: sanitize(user) });
  } catch (err) {
    console.error("❌ login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await findUserByEmail(email);

    // Always 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with that email, we've sent a reset link.",
      });
    }

    const token = makeToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.fullName, token);
    } catch (emailErr) {
      console.error("⚠️  Password reset email failed:", emailErr.message);
    }

    return res.status(200).json({
      message: "If an account exists with that email, we've sent a reset link.",
    });
  } catch (err) {
    console.error("❌ forgotPassword error:", err);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// ── POST /api/auth/reset-password/:token ─────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token)
      return res.status(400).json({ message: "Reset token is required" });
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const models = [Jobnode, Handyman, Employer];
    let user = null;

    for (const Model of models) {
      user = await Model.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
      if (user) break;
    }

    if (!user) {
      return res.status(400).json({
        message:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // Ensure email is marked verified (they proved email access)
    user.emailVerified = true;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
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

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

// ── POST /api/auth/change-password ───────────────────────────────────────────
// Requires current session (verifyToken middleware)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await findUserDocById(req.user.id, req.user.role);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Clear cookie so all other sessions are invalidated
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res
      .status(200)
      .json({ message: "Password changed successfully. Please log in again." });
  } catch (err) {
    console.error("❌ changePassword error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// ── DELETE /api/auth/account ──────────────────────────────────────────────────
// NDPA-compliant self-service account deletion (requires password confirmation)
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password confirmation is required" });
    }

    const user = await findUserDocById(req.user.id, req.user.role);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const { email, fullName } = user;

    // Delete the user document
    await user.deleteOne();

    // Clear session
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Send deletion confirmation email (non-blocking)
    try {
      await sendAccountDeletedEmail(email, fullName);
    } catch (emailErr) {
      console.error("⚠️  Account deletion email failed:", emailErr.message);
    }

    return res
      .status(200)
      .json({ message: "Your account has been permanently deleted." });
  } catch (err) {
    console.error("❌ deleteAccount error:", err);
    res.status(500).json({ message: "Account deletion failed" });
  }
};
