import mongoose from "mongoose";

const handymanSchema = new mongoose.Schema(
  {
    // ── existing ───────────────────────────────────────────────────────────────
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, default: "handyman", enum: ["handyman"] },
    skills: [{ type: String }],
    location: String,
    phone: String,
    whatsapp: String,
    trade: String,
    yearsExperience: { type: Number, default: 0 },
    certifications: String,
    bio: String,
    banned: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },

    // ── NEW: email verification ────────────────────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },

    // ── NEW: password reset ────────────────────────────────────────────────────
    resetPasswordToken: { type: String, default: null, index: true },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Handyman ||
  mongoose.model("Handyman", handymanSchema);
