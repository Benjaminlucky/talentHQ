// routes/auth.js
import express from "express";
import {
  signup2,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/signup2", signup2);
router.post("/login", login);
router.post("/logout", logout);

// Email verification
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ── Protected (requires valid session cookie) ─────────────────────────────────
router.get("/me", verifyToken, getMe);
router.post("/change-password", verifyToken, changePassword);
router.delete("/account", verifyToken, deleteAccount);

export default router;
