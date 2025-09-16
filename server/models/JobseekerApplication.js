import mongoose from "mongoose";

const JobseekerApplicationSchema = new mongoose.Schema(
  {
    jobseeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobnode",
      required: true,
    },
    roleTitle: {
      type: String,
      required: true,
    }, // e.g Frontend Developer
    roleType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"], // ✅ typo fixed
      default: "full-time",
    },
    preferredLocation: {
      type: String,
      required: true,
    }, // e.g Remote, Lagos.
    coverLetter: {
      type: String,
      required: true,
    }, // Short Motivation
    portfolioLinks: [{ type: String }],
    resume: {
      type: String,
    }, // Either reuse profile resume or allow per-application resume
    resumeAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Applications ||
  mongoose.model("Applications", JobseekerApplicationSchema);
