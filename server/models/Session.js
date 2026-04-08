import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  userModel: {
    type: String,
    required: true,
    enum: ["Jobnode", "Handyman", "Employer"],
  },
  // Store a hash of the JWT so we can invalidate without holding full tokens
  tokenHash: {
    type: String,
    required: true,
    index: true,
  },
  // Device / browser info for the sessions UI
  userAgent: { type: String, default: "" },
  ip: { type: String, default: "" },
  // Human-readable label parsed from UA
  device: { type: String, default: "Unknown device" },
  browser: { type: String, default: "Unknown browser" },
  // Whether this session has been explicitly revoked
  revoked: { type: Boolean, default: false },
  // Session expires in sync with the JWT (7 days)
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL: auto-remove expired sessions
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Session ||
  mongoose.model("Session", sessionSchema);
