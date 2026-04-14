// routes/superAdminRoutes.js
import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  refreshSuperAdminToken,
  logoutSuperAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.post("/signup", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.post("/refresh-token", refreshSuperAdminToken);
router.post("/logout", logoutSuperAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
