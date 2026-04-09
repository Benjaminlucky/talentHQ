import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, default: "employer", enum: ["employer"] },

    // ── Auth ──────────────────────────────────────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },

    // ── OAuth ─────────────────────────────────────────────────────────────────
    oauthProvider: {
      type: String,
      enum: ["google", "linkedin", null],
      default: null,
    },
    oauthId: { type: String, default: null },

    // ── Onboarding ────────────────────────────────────────────────────────────
    companyName: String,
    companyWebsite: String,
    companyLinkedin: String,
    phone: String,
    whatsapp: String,
    location: String,
    companySize: String,
    industry: String,
    contactPersonName: String,
    contactPersonDesignation: String,
    logo: String,

    // ── Reviews (cached aggregates — updated by reviewController.syncRatingCache) ──
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

employerSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

export default mongoose.models.Employer ||
  mongoose.model("Employer", employerSchema);
