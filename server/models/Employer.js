import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
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
    role: { type: String, default: "employer", enum: ["employer"] },
    companyName: String,
    companyWebsite: String,
    companyLinkedin: String,
    phone: String,
    whatsapp: String,
    location: String,
    companySize: String,
    industry: String,
    contactPersonName: String,
    contactPersonDesignation: String,
    logo: String,
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

export default mongoose.models.Employer ||
  mongoose.model("Employer", employerSchema);
