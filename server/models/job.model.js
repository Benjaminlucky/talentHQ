// models/job.model.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: { type: String },
    qualification: { type: String },
    skills: { type: String },
    benefits: { type: String },
    location: { type: String, required: true },
    state: String,
    lga: String,
    address: String,
    phoneNumber: String,
    category: String,

    jobFor: {
      type: String,
      enum: ["handyman", "professional"],
      default: "professional",
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      default: "Full-time",
    },

    status: {
      type: String,
      enum: ["open", "filled", "closed", "paused"],
      default: "open",
    },

    salary: String,
    experienceLevel: String,
    deadline: Date,

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
    },
    postedBy: {
      type: String,
      enum: ["employer", "superadmin"],
      default: "employer",
    },

    // ── Boost / Featured listing ──────────────────────────────────────────────
    boosted: {
      type: Boolean,
      default: false,
      index: true,
    },
    boostExpiresAt: {
      type: Date,
      default: null,
    },
    boostPaystackRef: {
      type: String,
      default: "",
    },
    // "featured" = pinned to very top of listings (higher tier than boost)
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ jobFor: 1, status: 1 });
// Boosted jobs surfaced first — sort by featured desc, boosted desc, createdAt desc
jobSchema.index({ featured: -1, boosted: -1, createdAt: -1 });

const JobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default JobModel;
