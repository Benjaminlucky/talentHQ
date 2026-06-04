// server/routes/OnboardingRoutes.js
import express from "express";
import {
  updateJobSeekerOnboarding,
  updateHandymanOnboarding,
  updateEmployerOnboarding,
} from "../controllers/OnboardingController.js";
import { uploadFields } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Jobseeker: resume (raw/pdf) + avatar (image) ──────────────────────────────
router.patch(
  "/jobseeker",
  verifyToken,
  uploadFields([
    { name: "resume", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  updateJobSeekerOnboarding,
);

// ── Handyman: avatar (image) ──────────────────────────────────────────────────
// The smart storage in upload.js routes "avatar" → imageCloudStorage automatically.
router.patch(
  "/handyman",
  verifyToken,
  uploadFields([{ name: "avatar", maxCount: 1 }]),
  updateHandymanOnboarding,
);

// ── Employer: logo (image) ────────────────────────────────────────────────────
router.patch(
  "/employer",
  verifyToken,
  uploadFields([{ name: "logo", maxCount: 1 }]),
  updateEmployerOnboarding,
);

export default router;
