// routes/jobSeekerRoutes.js
import express from "express";

import upload from "../middlewares/upload.js";
import {
  loginHandyman,
  refreshAccessToken,
  signupHandyman,
} from "../controllers/handymanController.js";

const router = express.Router();

// Add upload.single('resume') middleware
router.post("/signup", upload.single("resume"), signupHandyman);
router.post("/login", loginHandyman);
router.post("/refresh-token", refreshAccessToken);

export default router;
