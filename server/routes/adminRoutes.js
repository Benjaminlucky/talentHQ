import express from "express";
import {
  getPlatformMetrics,
  getAllUsers,
  getUserById,
  updateUser,
  banUser,
  deleteUser,
  verifySuperAdmin,
} from "../controllers/adminController.js";
import {
  getContactMessages,
  updateContactMessageStatus,
} from "../controllers/contactController.js";

const router = express.Router();

// All routes require superadmin Bearer token
router.use(verifySuperAdmin);

router.get("/metrics", getPlatformMetrics);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/contact-messages", getContactMessages);
router.patch("/contact-messages/:id", updateContactMessageStatus);

export default router; // ← this was missing, caused the import crash
