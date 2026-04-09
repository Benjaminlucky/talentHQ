// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // ── Who is being reviewed ──────────────────────────────────────────────────
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    subjectModel: {
      type: String,
      required: true,
      enum: ["Employer", "Handyman"],
    },

    // ── Who wrote the review ───────────────────────────────────────────────────
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reviewerModel: {
      type: String,
      required: true,
      enum: ["Jobnode", "Employer", "Handyman"],
    },
    // Cached so we don't need to re-query on every list render
    reviewerName: { type: String, required: true },
    reviewerAvatar: { type: String, default: "" },
    reviewerRole: {
      type: String,
      enum: ["jobseeker", "employer", "handyman"],
      required: true,
    },

    // ── Content ────────────────────────────────────────────────────────────────
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1500,
    },

    // ── Moderation ─────────────────────────────────────────────────────────────
    // Superadmin can hide a review without deleting it (audit trail)
    hidden: { type: Boolean, default: false },
    hiddenReason: { type: String, default: "" },

    // ── Business rules ─────────────────────────────────────────────────────────
    // Verified = reviewer had a real interaction with the subject
    // (e.g. jobseeker applied to employer's job, or employer hired the handyman)
    // For now default true — can tighten later with actual interaction check
    verified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One review per reviewer per subject — enforced at DB level
reviewSchema.index(
  { subjectId: 1, reviewerId: 1 },
  { unique: true, name: "one_review_per_pair" },
);

// Fast aggregate queries for avg rating
reviewSchema.index({ subjectId: 1, hidden: 1 });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
