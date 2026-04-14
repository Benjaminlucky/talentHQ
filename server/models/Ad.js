// models/Ad.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    // Who placed the ad
    placedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    placedByModel: {
      type: String,
      enum: ["Employer", "Jobnode", "Handyman"],
      required: true,
    },

    // Content
    title: { type: String, required: true, maxlength: 80 },
    description: { type: String, required: true, maxlength: 300 },
    imageUrl: { type: String, default: "" }, // base64 or URL
    linkUrl: { type: String, required: true }, // where the ad clicks to
    ctaText: { type: String, default: "Learn More" },

    // Placement
    zone: {
      type: String,
      enum: ["sidebar", "feed_top", "feed_inline", "findjob_banner"],
      required: true,
    },

    // Pricing & payment
    durationDays: { type: Number, required: true, min: 1, max: 90 },
    priceTotal: { type: Number, required: true }, // NGN
    paystackRef: { type: String, default: "" },

    // Lifecycle
    status: {
      type: String,
      enum: [
        "pending_payment",
        "pending_review",
        "active",
        "rejected",
        "expired",
      ],
      default: "pending_payment",
      index: true,
    },
    startsAt: { type: Date },
    expiresAt: { type: Date },

    // Stats
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    // Moderation
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

adSchema.index({ zone: 1, status: 1, expiresAt: 1 });

export default mongoose.models.Ad || mongoose.model("Ad", adSchema);
