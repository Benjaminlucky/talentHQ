import mongoose from "mongoose";

const jobnodeSchema = new mongoose.Schema(
  {
    // signup
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "jobseeker", enum: ["jobseeker"] },

    // profile basics
    headline: String,
    tagline: String,
    phone: String,
    whatsapp: String,
    location: {
      country: String,
      city: String,
      area: String,
    },
    linkedin: String,
    github: String,

    // ✅ NEW avatar field
    avatar: { type: String, default: "" }, // Base64 image string

    resume: { type: String, default: "" },
    resumePublic: { type: Boolean, default: true },

    // references
    skill: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    certifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Certification" },
    ],
    workExperience: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WorkExperience" },
    ],
    education: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

export default mongoose.models.Jobnode ||
  mongoose.model("Jobnode", jobnodeSchema);
