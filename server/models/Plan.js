// models/Plan.js
// Seed these with: node scripts/seedPlans.js
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // "free" | "starter" | "pro"
    displayName: { type: String, required: true }, // "Free" | "Starter" | "Pro"
    targetRole: {
      type: String,
      enum: ["employer", "jobseeker"],
      required: true,
    },

    // Pricing in kobo (Paystack uses kobo — 1 NGN = 100 kobo)
    priceMonthly: { type: Number, default: 0 }, // 0 = free
    priceYearly: { type: Number, default: 0 },

    // Feature flags — checked at runtime
    features: {
      // Employer features
      jobPostLimit: { type: Number, default: 3 }, // max active jobs (-1 = unlimited)
      boostCredits: { type: Number, default: 0 }, // job boost slots per month
      candidateUnlocks: { type: Number, default: 10 }, // full profile views per month
      featuredBadge: { type: Boolean, default: false },
      analyticsAccess: { type: Boolean, default: false },

      // Jobseeker features
      priorityBadge: { type: Boolean, default: false }, // shown to employers on applications
      profileAnalytics: { type: Boolean, default: false }, // who viewed, application stats
      resumeBoost: { type: Boolean, default: false }, // surfaced higher in candidate search
    },

    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
