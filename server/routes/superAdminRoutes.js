// routes/superAdminRoutes.js
import express from "express";
import {
  registerSuperAdmin,
  createSuperAdmin,
  loginSuperAdmin,
  refreshSuperAdminToken,
  logoutSuperAdmin,
  forgotPassword,
  resetPassword,
  verifySuperAdminToken,
} from "../controllers/superAdminController.js";
import { verifySuperAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Bootstrap-only: works once, to create the FIRST super admin (requires
// SUPERADMIN_SIGNUP_SECRET and only when no admins exist yet). Self-closes after.
router.post("/signup", registerSuperAdmin);

// Add ADDITIONAL super admins — requires an authenticated super admin.
router.post("/admins", verifySuperAdmin, createSuperAdmin);

router.post("/login", loginSuperAdmin);
router.post("/refresh-token", refreshSuperAdminToken);
router.post("/logout", logoutSuperAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Lightweight token check used by the client-side auth redirect hook
router.get("/verify", verifySuperAdminToken);

export default router;
