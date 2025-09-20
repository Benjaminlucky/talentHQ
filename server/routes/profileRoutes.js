import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  updateResume,
} from "../controllers/ProfileController.js";
import { verifyToken } from "../middlewares/auth.js";
import {
  addSkill,
  deleteSkill,
  getSkills,
  updateSkill,
} from "../controllers/SkillController.js";
import {
  addWorkExperience,
  deleteWorkExperience,
  getWorkExperiences,
  updateWorkExperience,
} from "../controllers/WorkExperienceController.js";
import {
  addEducation,
  deleteEducation,
  getEducations,
  updateEducation,
} from "../controllers/EducationController.js";
import {
  addProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../controllers/ProjectController.js";
import {
  addCertification,
  deleteCertification,
  getCertifications,
  updateCertification,
} from "../controllers/CertificationController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Profile
router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

// Skills
router.get("/me/skills", verifyToken, getSkills);
router.post("/me/skills", verifyToken, addSkill);
router.put("/me/skills/:id", verifyToken, updateSkill);
router.delete("/me/skills/:id", verifyToken, deleteSkill);

// Work Experience
router.get("/me/work-experiences", verifyToken, getWorkExperiences);
router.post("/me/work-experiences", verifyToken, addWorkExperience);
router.put("/me/work-experiences/:id", verifyToken, updateWorkExperience);
router.delete("/me/work-experiences/:id", verifyToken, deleteWorkExperience);

// Education
router.get("/me/education", verifyToken, getEducations);
router.post("/me/education", verifyToken, addEducation);
router.put("/me/education/:id", verifyToken, updateEducation);
router.delete("/me/education/:id", verifyToken, deleteEducation);

// Projects
router.get("/me/projects", verifyToken, getProjects);
router.post("/me/projects", verifyToken, addProject);
router.put("/me/project/:id", verifyToken, updateProject);
router.delete("/me/project/:id", verifyToken, deleteProject);

// Certifications
router.get("/me/certifications", verifyToken, getCertifications);
router.post("/me/certifications", verifyToken, addCertification);
router.put("/me/certifications/:id", verifyToken, updateCertification);
router.delete("/me/certifications/:id", verifyToken, deleteCertification);

// Resume upload
router.put("/me/resume", verifyToken, upload.single("resume"), updateResume);

export default router;
