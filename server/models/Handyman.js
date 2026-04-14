// models/Handyman.js
import mongoose from "mongoose";

const handymanSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "handyman", enum: ["handyman"] },

    skills: [{ type: String }],
    location: String,
    state: String,

    phone: String,
    whatsapp: String,
    trade: String,
    yearsExperience: { type: Number, default: 0 },
    certifications: String,
    bio: String,
    avatar: { type: String, default: "" },

    onboardingComplete: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
handymanSchema.index({ trade: 1 });
handymanSchema.index({ state: 1 });
handymanSchema.index({ avgRating: -1 });
handymanSchema.index({ createdAt: -1 });
// Compound: searching by trade + location is the most common query
handymanSchema.index({ trade: 1, state: 1, avgRating: -1 });

export default mongoose.models.Handyman ||
  mongoose.model("Handyman", handymanSchema);
