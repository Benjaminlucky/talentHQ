// models/Employer.js
import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "employer", enum: ["employer"] },
    companyName: String,
    companyWebsite: String,
    companyLinkedin: String,
    companyEmail: String,
    industry: String,
    companySize: String,
    location: String,
    state: String,
    lga: String,
    address: String,
    phone: String,
    whatsapp: String,
    logo: { type: String, default: "" },
    cacNumber: String,
    contactPersonName: String,
    contactPersonDesignation: String,
    contactPersonEmail: String,
    contactPersonPhone: String,
    onboardingComplete: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // Plan fields (set by subscription webhook)
    activePlan: { type: String, default: "employer_free" },
    planExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
employerSchema.index({ companyName: 1 });
employerSchema.index({ industry: 1 });
employerSchema.index({ state: 1 });
employerSchema.index({ avgRating: -1 });
employerSchema.index({ createdAt: -1 });
employerSchema.index({ onboardingComplete: 1, createdAt: -1 });

export default mongoose.models.Employer ||
  mongoose.model("Employer", employerSchema);
