// utils/notificationHelper.js
// Fire-and-forget helper — import this in any controller to create notifications.
// Never awaited directly; errors are swallowed so a notification failure never
// breaks the actual API response.

import Notification from "../models/Notification.js";

/**
 * createNotification({ recipientId, recipientModel, type, title, message, link })
 * Returns a Promise — callers should NOT await unless they need the result.
 */
export async function createNotification({
  recipientId,
  recipientModel,
  type,
  title,
  message,
  link = "",
}) {
  try {
    if (!recipientId || !recipientModel || !type || !title || !message) return;
    await Notification.create({
      recipientId,
      recipientModel,
      type,
      title,
      message,
      link,
    });
  } catch (err) {
    // Log but never throw — notification failure must not affect the main flow
    console.error("⚠️  Notification create failed (non-fatal):", err.message);
  }
}

/**
 * Resolve which Mongoose model string maps to a user role string.
 */
export function roleToModel(role) {
  const map = {
    jobseeker: "Jobnode",
    handyman: "Handyman",
    employer: "Employer",
  };
  return map[role] || "Jobnode";
}
