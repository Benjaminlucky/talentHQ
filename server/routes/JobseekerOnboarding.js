import express from "express";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";
import { updateJobSeekerOnboarding } from "../controllers/OnboardingController.js";

const router = express.Router();

// PATCH with optional resume upload
router.patch(
  "/jobseeker",
  verifyToken,
  upload.single("resume"),
  updateJobSeekerOnboarding
);

export default router;
