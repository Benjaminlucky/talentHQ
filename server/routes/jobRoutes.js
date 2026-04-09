// routes/jobRoutes.js
import express from "express";
import {
  getJobs,
  createJob,
  getJobById,
  getMyJobs,
  deleteJob,
} from "../controllers/jobController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getJobs);
router.get("/:id", getJobById);

// ── Employer / superadmin ─────────────────────────────────────────────────────
// POST /api/jobs — create a job (employer posts their own; superadmin specifies company)
router.post("/", verifyToken, createJob);

// GET  /api/jobs/me/posted — employer sees their own posted jobs
router.get("/me/posted", verifyToken, getMyJobs);

// DELETE /api/jobs/:id — employer deletes their own job
router.delete("/:id", verifyToken, deleteJob);

export default router;
