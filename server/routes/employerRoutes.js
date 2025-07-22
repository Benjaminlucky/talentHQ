import express from "express";
import {
  getEmployerDashboard,
  loginEmployer,
  logoutEmployer,
  refreshEmployerToken,
  signupEmployer,
} from "../controllers/employerController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupEmployer);
router.post("/login", loginEmployer);
router.post("/refresh-token", refreshEmployerToken);
router.get(
  "/dashboard-employer",
  authenticateToken,
  authorizeRole("employer"),
  getEmployerDashboard
);
router.post("/logout", logoutEmployer);

export default router;
