// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // ── Recipient ─────────────────────────────────────────────────────────────
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    recipientModel: {
      type: String,
      enum: ["Jobnode", "Handyman", "Employer"],
      required: true,
    },

    // ── Content ───────────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "application_received", // employer: someone applied
        "application_status", // jobseeker: their app was accepted/rejected
        "interview_scheduled", // jobseeker/handyman: employer booked interview
        "interview_responded", // employer: candidate accepted/declined
        "new_message", // anyone: received a message
        "review_received", // employer/handyman: got a review
      ],
      required: true,
    },

    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },

    // ── Navigation ────────────────────────────────────────────────────────────
    // URL to navigate to when notification is clicked
    link: { type: String, default: "" },

    // ── State ─────────────────────────────────────────────────────────────────
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Compound index for fast per-user unread queries
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

// Auto-delete notifications older than 60 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 },
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
