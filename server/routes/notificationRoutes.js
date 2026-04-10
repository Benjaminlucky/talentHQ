// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  clearAll,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/mark-all-read", markAllRead);
router.delete("/clear-all", clearAll);
router.patch("/:id/read", markRead);
router.delete("/:id", deleteNotification);

export default router;
