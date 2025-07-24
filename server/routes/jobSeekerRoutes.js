// routes/jobSeekerRoutes.js
import express from "express";
import {
  loginJobSeeker,
  logoutJobSeeker,
  refreshAccessToken,
  signupJobSeeker,
} from "../controllers/jobSeekerController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Add upload.single('resume') middleware
router.post("/signup", upload.single("resume"), signupJobSeeker);
router.post("/login", loginJobSeeker);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutJobSeeker);

export default router;
