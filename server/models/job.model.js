import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    state: String,
    lga: String,
    address: String,
    phoneNumber: String, // Contact number for this job post
    category: String, // e.g., IT, Plumbing, Teaching
    jobFor: {
      type: String,
      enum: ["handyman", "professional"],
      default: "professional",
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      default: "Full-time",
    },
    salary: String,
    experienceLevel: String,
    deadline: Date,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
    },
    postedBy: {
      type: String,
      enum: ["employer", "admin"],
      default: "employer",
    },
  },
  { timestamps: true }
);

const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;
