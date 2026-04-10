// controllers/notificationController.js
import Notification from "../models/Notification.js";
import { roleToModel } from "../utils/notificationHelper.js";

// ── GET /api/notifications ────────────────────────────────────────────────────
// Paginated list for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const model = roleToModel(req.user.role);

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipientId: req.user.id, recipientModel: model })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments({
        recipientId: req.user.id,
        recipientModel: model,
      }),
      Notification.countDocuments({
        recipientId: req.user.id,
        recipientModel: model,
        read: false,
      }),
    ]);

    res.json({ notifications, total, unread, page: Number(page) });
  } catch (err) {
    console.error("❌ getNotifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ── GET /api/notifications/unread-count ───────────────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const model = roleToModel(req.user.role);
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      recipientModel: model,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { read: true },
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark read" });
  }
};

// ── PATCH /api/notifications/mark-all-read ────────────────────────────────────
export const markAllRead = async (req, res) => {
  try {
    const model = roleToModel(req.user.role);
    await Notification.updateMany(
      { recipientId: req.user.id, recipientModel: model, read: false },
      { read: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all read" });
  }
};

// ── DELETE /api/notifications/:id ─────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id,
    });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// ── DELETE /api/notifications/clear-all ───────────────────────────────────────
export const clearAll = async (req, res) => {
  try {
    const model = roleToModel(req.user.role);
    await Notification.deleteMany({
      recipientId: req.user.id,
      recipientModel: model,
    });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};
