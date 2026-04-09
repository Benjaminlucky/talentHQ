// models/JobseekerApplication.js
import mongoose from "mongoose";

const JobseekerApplicationSchema = new mongoose.Schema(
  {
    jobseeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobnode",
      required: true,
    },
    roleTitle: { type: String, required: true },
    roleType: {
      type: String,
      enum: [
        "full-time",
        "full-time role",
        "part-time",
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
    // Visible to the jobseeker on their applications page.
    employerMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

// Index for fast employer queries
JobseekerApplicationSchema.index({ status: 1, createdAt: -1 });
JobseekerApplicationSchema.index({ jobseeker: 1 });

export default mongoose.models.Applications ||
  mongoose.model("Applications", JobseekerApplicationSchema);
