import mongoose from "mongoose";

const handymanSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    lga: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      required: true,
    },
    currentStatus: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      required: false,
    },
    portfolio: {
      type: String,
      required: false,
    },
    jobType: [
      {
        type: String,
        required: true,
      },
    ],
    expectedSalary: {
      type: String,
      required: true,
    },
    skills: {
      type: String, // Store as comma-separated string
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    workSummary: {
      type: String,
      required: true,
    },
    resume: {
      type: String, // Will hold the filename or URL
      required: false,
    },
    agreeToTerms: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      default: "handyman",
      enum: ["handyman"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Handyman", handymanSchema);
