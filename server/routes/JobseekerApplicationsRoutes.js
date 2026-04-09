// routes/JobseekerApplicationsRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createApplication,
  getAllApplications,
  getMyApplications,
  updateApplicationStatus,
  deleteApplication,
  getApplicationById,
  getResume,
} from "../controllers/JobseekerApplicationsController.js";

const router = express.Router();

// ── Jobseeker routes (authenticated) ─────────────────────────────────────────
router.post("/me/applications", verifyToken, createApplication);
router.get("/me/applications", verifyToken, getMyApplications);
router.delete("/me/applications/:id", verifyToken, deleteApplication);

// ── Public routes ─────────────────────────────────────────────────────────────
// GET /api/profile/applications — used by homepage FeaturedCandidates (public)
// GET /api/profile/applications/:id — single candidate detail (public)
router.get("/applications", getAllApplications); // ← public, no verifyToken
router.get("/applications/:id", getApplicationById); // ← public

// ── Employer-only routes (authenticated) ──────────────────────────────────────
// PUT /api/profile/applications/:id/status — accept / reject (employer only)
router.put("/applications/:id/status", verifyToken, updateApplicationStatus);

// Resume (authenticated — privacy)
router.get("/applications/:id/resume", verifyToken, getResume);

export default router;
