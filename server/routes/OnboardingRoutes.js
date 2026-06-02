// server/routes/OnboardingRoutes.js
import express from "express";
import {
  updateJobSeekerOnboarding,
  updateHandymanOnboarding,
  updateEmployerOnboarding,
} from "../controllers/OnboardingController.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Jobseeker: resume (raw/pdf) + avatar (image) ──────────────────────────────
router.patch(
  "/jobseeker",
  verifyToken,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  updateJobSeekerOnboarding,
);

// ── Handyman: avatar (image) — FIX: was JSON-only, now has upload middleware ──
// The smart storage in upload.js routes "avatar" → imageCloudStorage automatically.
router.patch(
  "/handyman",
  verifyToken,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateHandymanOnboarding,
);

// ── Employer: logo (image) ────────────────────────────────────────────────────
router.patch(
  "/employer",
  verifyToken,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  updateEmployerOnboarding,
);

export default router;
