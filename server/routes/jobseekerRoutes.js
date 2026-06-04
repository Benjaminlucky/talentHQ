// routes/jobseekerRoutes.js
import express from "express";
import {
  getPublicJobseekers,
  getPublicJobseekerById,
} from "../controllers/publicTalentController.js";

const router = express.Router();

// Public — no auth required
router.get("/", getPublicJobseekers);
router.get("/:id", getPublicJobseekerById);

export default router;
