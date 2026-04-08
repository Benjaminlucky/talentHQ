// server/routes/oauthRoutes.js
import express from "express";
import passport from "../middlewares/passport.js";
import { handleOAuthCallback } from "../controllers/oauthController.js";

const router = express.Router();

// ── Google ────────────────────────────────────────────────────────────────────
// Step 1: redirect user to Google's consent screen
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Step 2: Google redirects back here after user consents
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=google_failed`,
  }),
  handleOAuthCallback,
);

// ── LinkedIn ──────────────────────────────────────────────────────────────────
router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["openid", "profile", "email"],
    session: false,
  }),
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=linkedin_failed`,
  }),
  handleOAuthCallback,
);

export default router;
