// routes/interviewRoutes.js
import express from "express";
import {
  scheduleInterview,
  getEmployerInterviews,
  getJobseekerInterviews,
  getInterviewsByApplication,
  updateInterview,
  respondToInterview,
  deleteInterview,
} from "../controllers/interviewController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", scheduleInterview);
router.get("/employer", getEmployerInterviews);
router.get("/jobseeker", getJobseekerInterviews);
router.get("/application/:applicationId", getInterviewsByApplication);
router.put("/:id", updateInterview);
router.patch("/:id/respond", respondToInterview);
router.delete("/:id", deleteInterview);

export default router;
