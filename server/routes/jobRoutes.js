import express from "express";
import {
  getJobs,
  createJob,
  getJobById,
} from "../controllers/jobController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getJobs);
router.get("/:id", getJobById);

// Protected: employer OR superadmin
router.post(
  "/",
  authenticateToken,
  authorizeRole("employer", "superadmin"),
  createJob
);

export default router;
