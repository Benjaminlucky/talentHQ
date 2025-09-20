import express from "express";

import {
  updateJobSeekerOnboarding,
  updateHandymanOnboarding,
  updateEmployerOnboarding,
} from "../controllers/onboardingController.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Resume upload handled automatically by multer
router.patch(
  "/jobseeker",
  verifyToken,
  upload.single("resume"),
  updateJobSeekerOnboarding
);
router.patch("/handyman", verifyToken, updateHandymanOnboarding);
router.patch("/employer", verifyToken, updateEmployerOnboarding);

export default router;
