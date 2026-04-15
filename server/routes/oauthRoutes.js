// server/routes/oauthRoutes.js
import express from "express";
import passport from "../middlewares/passport.js";
import {
  handleOAuthCallback,
  setOAuthRole,
} from "../controllers/oauthController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

const FRONTEND =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq.buzz"
    : "http://localhost:3000");

// ── Google ────────────────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: true,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: `${FRONTEND}/login?error=google_failed`,
  }),
  handleOAuthCallback,
);

// ── LinkedIn ──────────────────────────────────────────────────────────────────
router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["openid", "profile", "email"],
    session: true,
  }),
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    session: true,
    failureRedirect: `${FRONTEND}/login?error=linkedin_failed`,
  }),
  handleOAuthCallback,
);

// ── POST /api/auth/oauth/set-role ─────────────────────────────────────────────
// Frontend calls: POST /api/auth/oauth/set-role
// Router is mounted at /api/auth, so this path must be /oauth/set-role
router.post("/oauth/set-role", verifyToken, setOAuthRole);

export default router;
