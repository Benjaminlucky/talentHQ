// controllers/superAdminController.js
// Adds forgotPassword to the existing controller.
// All existing exports (registerSuperAdmin, loginSuperAdmin, etc.) are preserved exactly.

import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/superAdmin.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const signAccessToken = (admin) =>
  jwt.sign({ id: admin._id, role: "superadmin" }, JWT_SECRET, {
    expiresIn: "1h",
  });
const signRefreshToken = (admin) =>
  jwt.sign({ id: admin._id, role: "superadmin" }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

// POST /api/superadmin/signup
export const registerSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existing = await SuperAdmin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists." });

    const hashed = await bcrypt.hash(password, 10);
    await SuperAdmin.create({ fullName, email, password: hashed });
    return res
      .status(201)
      .json({ message: "Super Admin registered successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/superadmin/login
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await SuperAdmin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(admin);
    const refreshToken = signRefreshToken(admin);
    admin.refreshToken = refreshToken;
    await admin.save();

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      superadmin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role || "superadmin",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/superadmin/refresh-token
export const refreshSuperAdminToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token required." });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const admin = await SuperAdmin.findById(decoded.id);
    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }
    const newAccessToken = signAccessToken(admin);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Token expired or invalid." });
  }
};

// POST /api/superadmin/logout
export const logoutSuperAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await SuperAdmin.findOneAndUpdate(
        { refreshToken },
        { refreshToken: null },
      );
    }
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Logout failed." });
  }
};

// ── NEW: POST /api/superadmin/forgot-password ──────────────────────────────────
// Generates a reset token and sends an email via Resend (if configured).
// Always responds 200 to prevent email enumeration.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Always respond 200 first — never reveal whether email exists
    res.status(200).json({
      message: "If this email is registered, a reset link has been sent.",
    });

    if (!email) return;

    const admin = await SuperAdmin.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!admin) return; // silently stop — response already sent

    // Generate a secure random token (32 bytes hex = 64 chars)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    admin.passwordResetToken = token;
    admin.passwordResetExpires = expiry;
    await admin.save();

    const resetUrl = `${FRONTEND_URL}/admin/reset-password?token=${token}`;

    // Send via Resend if configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@talenthq.ng";

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: email,
          subject: "TalentHQ Admin — Password Reset",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
              <h2 style="color:#003017;font-weight:900">Password reset request</h2>
              <p style="color:#555">You requested a password reset for your TalentHQ Super Admin account.</p>
              <p style="color:#555">Click the button below to reset your password. This link expires in <strong>30 minutes</strong>.</p>
              <a href="${resetUrl}"
                style="display:inline-block;margin:20px 0;padding:14px 28px;background:#004B23;color:#fff;font-weight:700;border-radius:12px;text-decoration:none">
                Reset Password
              </a>
              <p style="color:#999;font-size:12px">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
              <p style="color:#ccc;font-size:11px">TalentHQ · Authorised admin access only</p>
            </div>
          `,
        }),
      }).catch((e) =>
        console.error("⚠️ Resend email failed (non-fatal):", e.message),
      );
    } else {
      // Log reset link to console in development when Resend not configured
      console.log(`🔑 Admin password reset link (DEV): ${resetUrl}`);
    }
  } catch (err) {
    console.error("❌ forgotPassword:", err);
    // Response already sent — just log
  }
};

// ── NEW: POST /api/superadmin/reset-password ───────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const admin = await SuperAdmin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    admin.password = await bcrypt.hash(password, 10);
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    admin.refreshToken = null; // invalidate all sessions
    await admin.save();

    return res
      .status(200)
      .json({ message: "Password reset successfully. Please log in." });
  } catch (err) {
    console.error("❌ resetPassword:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
