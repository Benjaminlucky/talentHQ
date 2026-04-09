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

// ── Jobseeker routes ──────────────────────────────────────────────────────────
router.post("/me/applications", verifyToken, createApplication);
router.get("/me/applications", verifyToken, getMyApplications);
router.delete("/me/applications/:id", verifyToken, deleteApplication);

// ── Employer / admin routes ───────────────────────────────────────────────────
// GET  /api/profile/applications          — list all (with filter/search/pagination)
// GET  /api/profile/applications/:id      — single application with full candidate profile
// PUT  /api/profile/applications/:id/status — accept / reject / review (employer only)
router.get("/applications", verifyToken, getAllApplications);
router.get("/applications/:id", getApplicationById);
router.put("/applications/:id/status", verifyToken, updateApplicationStatus);

// Resume
router.get("/applications/:id/resume", verifyToken, getResume);

export default router;
