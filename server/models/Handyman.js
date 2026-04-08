import mongoose from "mongoose";

const handymanSchema = new mongoose.Schema(
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
    role: { type: String, default: "handyman", enum: ["handyman"] },
    skills: [{ type: String }],
    location: String,

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
    phone: String,
    whatsapp: String,
    trade: String,
    yearsExperience: { type: Number, default: 0 },
    certifications: String,
    bio: String,
  },
  { timestamps: true },
);

handymanSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

export default mongoose.models.Handyman ||
  mongoose.model("Handyman", handymanSchema);
