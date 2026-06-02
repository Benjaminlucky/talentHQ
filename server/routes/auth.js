// server/routes/auth.js
import express from "express";
import {
  signup2,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/signup2", signup2);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);

// ── Protected routes (JWT cookie required) ────────────────────────────────────
router.get("/me", verifyToken, getMe);
router.post("/resend-verification", verifyToken, resendVerification);
router.patch("/change-password", verifyToken, changePassword);

export default router;
