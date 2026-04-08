// models/Jobnode.js — add auth fields to existing schema
// PATCH: add these fields inside the jobnodeSchema definition

import mongoose from "mongoose";

const jobnodeSchema = new mongoose.Schema(
  {
    // ── existing signup fields ─────────────────────────────────────────────────
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

    // ── existing profile fields ────────────────────────────────────────────────
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

    // ── existing references ────────────────────────────────────────────────────
    skill: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    certifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Certification" },
    ],
    workExperience: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WorkExperience" },
    ],
    education: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],

    // ── from critical blockers delivery ───────────────────────────────────────
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

export default mongoose.models.Jobnode ||
  mongoose.model("Jobnode", jobnodeSchema);
