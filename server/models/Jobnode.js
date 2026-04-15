// models/Jobnode.js
import mongoose from "mongoose";

const jobnodeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "jobseeker", enum: ["jobseeker"] },

    headline: String,
    tagline: String,
    phone: String,
    whatsapp: String,
    location: {
      country: String,
      city: String,
      area: String,
    },
    linkedin: String,
    github: String,
    avatar: { type: String, default: "" },
    resume: { type: String, default: "" },
    resumePublic: { type: Boolean, default: true },

    // ── OAuth ─────────────────────────────────────────────────────────────────
    oauthProvider: { type: String, default: null }, // "google" | "linkedin" | null
    oauthId: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },

    // ── Onboarding / role flow ────────────────────────────────────────────────
    // needsRoleSelection: true = brand-new OAuth user who hasn't picked a role yet
    // They land on /oauth/select-role, pick a role, then this is set to false.
    needsRoleSelection: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },

    // ── Plan fields (set by subscription webhook) ─────────────────────────────
    activePlan: { type: String, default: "jobseeker_free" },
    planExpiresAt: { type: Date, default: null },

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

// ── Indexes ───────────────────────────────────────────────────────────────────
jobnodeSchema.index({ createdAt: -1 });
jobnodeSchema.index({ "location.city": 1 });
jobnodeSchema.index({ activePlan: 1 });
jobnodeSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

export default mongoose.models.Jobnode ||
  mongoose.model("Jobnode", jobnodeSchema);
