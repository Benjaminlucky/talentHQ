// models/superAdmin.model.js
import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, default: "superadmin" },

    refreshToken: { type: String, default: "" },

    // ── Password reset ────────────────────────────────────────────────────────
    passwordResetToken: { type: String, default: undefined },
    passwordResetExpires: { type: Number, default: undefined }, // Unix ms timestamp
  },
  { timestamps: true },
);

export default mongoose.models?.SuperAdmin ||
  mongoose.model("SuperAdmin", superAdminSchema);
