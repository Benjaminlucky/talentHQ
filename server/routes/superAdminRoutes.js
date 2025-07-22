import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  refreshSuperAdminToken,
  logoutSuperAdmin,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.post("/signup", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.post("/refresh-token", refreshSuperAdminToken);
router.post("/logout", logoutSuperAdmin);

export default router;
