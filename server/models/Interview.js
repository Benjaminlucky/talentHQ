// models/Interview.js
import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    // ── Who is involved ────────────────────────────────────────────────────────
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applications",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    // Polymorphic — the candidate may be a Jobnode (jobseeker) or a Handyman.
    // Field name kept as jobseekerId so existing code/UI keeps working; the
    // referenced collection is resolved via jobseekerModel (refPath). Existing
    // interview docs created before this change have no jobseekerModel and
    // default to "Jobnode" — unchanged behaviour for current data.
    jobseekerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "jobseekerModel",
    },
    jobseekerModel: {
      type: String,
      enum: ["Jobnode", "Handyman"],
      default: "Jobnode",
    },

    // ── Scheduling ─────────────────────────────────────────────────────────────
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "10:00 AM"
    timezone: { type: String, default: "Africa/Lagos" },

    // ── Interview format ───────────────────────────────────────────────────────
    format: {
      type: String,
      enum: ["video", "phone", "in-person"],
      required: true,
    },
    location: { type: String, default: "" }, // physical address or meeting link
    platform: { type: String, default: "" }, // e.g. "Google Meet", "Zoom"

    // ── Content ────────────────────────────────────────────────────────────────
    title: { type: String, required: true, maxlength: 120 },
    notes: { type: String, default: "", maxlength: 2000 },

    // ── Status ─────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "rescheduled", "cancelled", "completed"],
      default: "scheduled",
    },

    // Jobseeker can confirm or decline via the platform
    candidateResponse: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    candidateNote: { type: String, default: "" },
  },
  { timestamps: true },
);

interviewSchema.index({ applicationId: 1 });
interviewSchema.index({ employerId: 1, date: -1 });
interviewSchema.index({ jobseekerId: 1, date: -1 });

export default mongoose.models.Interview ||
  mongoose.model("Interview", interviewSchema);
