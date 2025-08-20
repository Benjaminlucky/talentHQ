import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }, // About this role
    responsibilities: { type: String }, // Comma-separated text
    qualification: { type: String }, // Single qualification text
    skills: { type: String }, // Comma-separated skills
    benefits: { type: String }, // Comma-separated benefits
    location: { type: String, required: true },
    state: String,
    lga: String,
    address: String,
    phoneNumber: String,
    category: String,
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
      enum: ["employer", "superadmin"],
      default: "employer",
    },
  },
  { timestamps: true }
);

const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;
