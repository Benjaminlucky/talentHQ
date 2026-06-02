// models/JobseekerApplication.js
import mongoose from "mongoose";

const JobseekerApplicationSchema = new mongoose.Schema(
  {
    // ── Applicant (polymorphic) ───────────────────────────────────────────────
    // Field stays named "jobseeker" so all existing code/UI keeps working, but
    // it now uses refPath so it can reference EITHER a Jobnode (jobseeker) OR a
    // Handyman, resolved via applicantModel. Documents created before this
    // change have no applicantModel and default to "Jobnode" — unchanged
    // behaviour for all existing data.
    jobseeker: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "applicantModel",
    },
    applicantModel: {
      type: String,
      enum: ["Jobnode", "Handyman"],
      default: "Jobnode",
    },
    // Convenience role string for the frontend ("jobseeker" | "handyman")
    applicantRole: {
      type: String,
      enum: ["jobseeker", "handyman"],
      default: "jobseeker",
    },

    roleTitle: { type: String, required: true },
    roleType: {
      type: String,
      enum: [
        "full-time",
        "full-time role",
        "part-time",
        "part-time role",
        "contract",
        "internship",
        "remote",
      ],
      default: "full-time",
    },
    preferredLocation: { type: String, required: true },
    coverLetter: { type: String, required: true },
    portfolioLinks: [{ type: String }],
    resume: { type: String },
    resumeAvailable: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },

    // ── Employer response ─────────────────────────────────────────────────────
    // Optional message from the employer when they update the status.
    // Visible to the applicant on their applications page.
    employerMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

// Indexes for fast queries
JobseekerApplicationSchema.index({ status: 1, createdAt: -1 });
JobseekerApplicationSchema.index({ jobseeker: 1 });
JobseekerApplicationSchema.index({ applicantRole: 1, createdAt: -1 });

export default mongoose.models.Applications ||
  mongoose.model("Applications", JobseekerApplicationSchema);
