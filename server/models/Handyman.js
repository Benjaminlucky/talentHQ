import mongoose from "mongoose";

const handymanSchema = new mongoose.Schema(
  {
    // signup
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "handyman", enum: ["handyman"] },
    skills: [{ type: String }], // optional at signup
    location: String, // optional at signup

    // onboarding (handyman)
    phone: String,
    whatsapp: String,
    trade: String,
    yearsExperience: { type: Number, default: 0 },
    certifications: String,
  },
  { timestamps: true }
);

export default mongoose.models.Handyman ||
  mongoose.model("Handyman", handymanSchema);
