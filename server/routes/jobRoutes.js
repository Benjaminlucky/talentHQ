import express from "express";
import {
  getJobs,
  createJob,
  getJobById,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getJobs); // ✅ Paginated list
router.get("/:id", getJobById); // ✅ Single job
router.post("/", createJob); // ✅ Create job

export default router;
