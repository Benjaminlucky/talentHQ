import mongoose from "mongoose";

// A single collection handles both email verification tokens
// and password reset tokens — distinguished by the `type` field.
const emailTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  // Which model the userId belongs to
  userModel: {
    type: String,
    required: true,
    enum: ["Jobnode", "Handyman", "Employer"],
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["email_verification", "password_reset"],
  },
  expiresAt: {
    type: Date,
    required: true,
    // MongoDB TTL index: documents auto-deleted when expiresAt passes
    index: { expires: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EmailToken ||
  mongoose.model("EmailToken", emailTokenSchema);
