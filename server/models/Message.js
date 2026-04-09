// models/Message.js
import mongoose from "mongoose";

// A Conversation groups messages between exactly two participants.
// participantIds is always sorted so we can do deterministic lookup.
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userModel: {
          type: String,
          required: true,
          enum: ["Jobnode", "Handyman", "Employer"],
        },
        fullName: { type: String, required: true },
        avatar: { type: String, default: "" },
        role: { type: String, required: true },
      },
    ],
    // Cached last message for conversation list preview
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    // Unread counts per participant index (0 or 1)
    unreadCount: { type: [Number], default: [0, 0] },
  },
  { timestamps: true },
);

// Fast lookup: find conversation between two users
conversationSchema.index({ "participants.userId": 1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

// ─────────────────────────────────────────────────────────────────────────────

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Jobnode", "Handyman", "Employer"],
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
