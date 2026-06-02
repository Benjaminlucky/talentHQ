// server/models/Handyman.js
// ADD the avatar field — this is the only change needed to the existing model.
// Everything else stays exactly as it was.
//
// Find this block in your existing Handyman.js:
//
//   fullName: { type: String, required: true },
//   email:    { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role:     { type: String, default: "handyman", enum: ["handyman"] },
//   trade:            String,
//   yearsExperience:  Number,
//   location:         String,
//   bio:              String,
//   skills:           [String],
//   ...
//
// ADD this line alongside the other fields (after "bio" is a good place):
//
//   avatar: { type: String, default: "" },
//
// Full updated schema fields list for reference:

import mongoose from "mongoose";

const handymanSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "handyman", enum: ["handyman"] },

    trade: String,
    yearsExperience: { type: Number, default: 0 },
    location: String, // "City, State" string (flat — different from Jobnode)
    bio: String,
    skills: [String], // plain string array (different from Jobnode's ObjectId refs)

    // ── ADD THIS FIELD ────────────────────────────────────────────────────
    avatar: { type: String, default: "" },
    // ─────────────────────────────────────────────────────────────────────

    certifications: String, // comma-separated string at onboarding

    // ── OAuth ─────────────────────────────────────────────────────────────
    oauthProvider: { type: String, default: null },
    oauthId: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    needsRoleSelection: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },

    // ── Plan ──────────────────────────────────────────────────────────────
    activePlan: { type: String, default: "handyman_free" },
    planExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

handymanSchema.index({ trade: 1 });
handymanSchema.index({ location: 1 });
handymanSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

export default mongoose.models.Handyman ||
  mongoose.model("Handyman", handymanSchema);
