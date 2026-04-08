import express from "express";
import {
  updateJobSeekerOnboarding,
  updateHandymanOnboarding,
  updateEmployerOnboarding,
} from "../controllers/OnboardingController.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// Jobseeker: accepts resume + avatar
// upload.single("resume") was rejecting the "avatar" field with MulterError: Unexpected field
// upload.fields() accepts multiple named fields without that error
router.patch(
  "/jobseeker",
  verifyToken,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  updateJobSeekerOnboarding,
);

// Handyman: no file uploads at onboarding
router.patch("/handyman", verifyToken, updateHandymanOnboarding);

// Employer: logo only
router.patch(
  "/employer",
  verifyToken,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  updateEmployerOnboarding,
);

export default router;
