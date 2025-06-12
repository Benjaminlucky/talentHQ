import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    lga: {
      type: String,
    },
    location: {
      type: String,
    },
    jobCategory: {
      type: String,
    },
    experienceLevel: {
      type: String,
    },
    currentStatus: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    jobType: {
      type: [String],
    },
    expectedSalary: {
      type: String,
    },
    skills: {
      type: String,
    },
    education: {
      type: String,
    },
    workSummary: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    agreeToTerms: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      default: "jobseeker",
      enum: ["jobseeker"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.JobSeeker ||
  mongoose.model("JobSeeker", jobSeekerSchema);
