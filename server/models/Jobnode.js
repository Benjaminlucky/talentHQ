// server/models/Jobnode.js
import mongoose from "mongoose";

const jobnodeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, default: "jobseeker", enum: ["jobseeker"] },

    // ── Auth ──────────────────────────────────────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },

    // ── OAuth (Google / LinkedIn) ─────────────────────────────────────────────
    oauthProvider: {
      type: String,
      enum: ["google", "linkedin", null],
      default: null,
    },
    oauthId: { type: String, default: null },

    // ── Profile ───────────────────────────────────────────────────────────────
    headline: String,
    tagline: String,
    phone: String,
    whatsapp: String,
    location: { country: String, city: String, area: String },
    linkedin: String,
    github: String,
    avatar: { type: String, default: "" },
    resume: { type: String, default: "" },
    resumePublic: { type: Boolean, default: true },

    // ── References ────────────────────────────────────────────────────────────
    skill: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    certifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Certification" },
    ],
    workExperience: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WorkExperience" },
    ],
    education: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true },
);

// Compound index so OAuth lookups are fast
jobnodeSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

export default mongoose.models.Jobnode ||
  mongoose.model("Jobnode", jobnodeSchema);
