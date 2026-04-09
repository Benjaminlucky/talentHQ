// routes/jobRoutes.js
import express from "express";
import {
  getJobs,
  createJob,
  getJobById,
  getMyJobs,
  updateJobStatus,
  deleteJob,
  getEmployerPublicProfile,
} from "../controllers/jobController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getJobs);

// Employer public profile — must come BEFORE /:id to avoid conflict
router.get("/employer/:employerId/profile", getEmployerPublicProfile);

router.get("/:id", getJobById);

// ── Employer / superadmin (authenticated) ─────────────────────────────────────
router.post("/", verifyToken, createJob);

// Employer sees their own posted jobs (all statuses)
router.get("/me/posted", verifyToken, getMyJobs);

// Update status: open → filled / closed / paused
router.patch("/:id/status", verifyToken, updateJobStatus);

// Delete a job
router.delete("/:id", verifyToken, deleteJob);

export default router;
