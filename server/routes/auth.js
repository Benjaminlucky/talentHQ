import express from "express";
import {
  signup2,
  login,
  logout,
  getMe,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getSessions,
  revokeSession,
  revokeAllOtherSessions,
  deleteAccount,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/signup2", signup2);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail); // token in query string

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);
router.post("/resend-verification", verifyToken, resendVerification);

// Sessions
router.get("/sessions", verifyToken, getSessions);
router.delete("/sessions", verifyToken, revokeAllOtherSessions);
router.delete("/sessions/:sessionId", verifyToken, revokeSession);

// Account deletion
router.delete("/account", verifyToken, deleteAccount);

export default router;
