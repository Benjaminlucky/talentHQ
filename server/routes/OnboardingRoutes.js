import express from "express";
import multer from "multer";

import {
  updateJobSeekerOnboarding,
  updateHandymanOnboarding,
  updateEmployerOnboarding,
} from "../controllers/OnboardingController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// storage for resume uploads
const storage = multer.diskStorage({
  destination: "uploads/resumes/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// jobseeker (with resume)
router.patch(
  "/jobseeker",
  verifyToken,
  upload.single("resume"),
  updateJobSeekerOnboarding
);

// handyman
router.patch("/handyman", verifyToken, updateHandymanOnboarding);

// employer
router.patch("/employer", verifyToken, updateEmployerOnboarding);

export default router;
