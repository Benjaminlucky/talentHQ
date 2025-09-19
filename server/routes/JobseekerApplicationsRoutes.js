import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createApplication,
  getAllApplications,
  getMyApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/JobseekerApplicationsController.js";

const router = express.Router();

// jobseeker
router.post("/me/applications", verifyToken, createApplication);
router.get("/me/applications", verifyToken, getMyApplications);
router.delete("/me/applications/:id", verifyToken, deleteApplication);

// employers (public listing or admin)
router.get("/applications", getAllApplications);
router.put("/applications/:id/status", updateApplicationStatus);

export default router;
