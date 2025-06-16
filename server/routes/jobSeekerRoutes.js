// routes/jobSeekerRoutes.js
import express from "express";
import {
  loginJobSeeker,
  refreshAccessToken,
  signupJobSeeker,
} from "../controllers/jobSeekerController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Add upload.single('resume') middleware
router.post("/signup", upload.single("resume"), signupJobSeeker);
router.post("/login", loginJobSeeker);
router.post("/refresh-token", refreshAccessToken);

export default router;
