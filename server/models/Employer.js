import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    // signup
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "employer", enum: ["employer"] },
    companyName: String,
    companyWebsite: String,

    // onboarding (employer)
    phone: String,
    whatsapp: String,
    location: String,
    companySize: String,
    industry: String,
  },
  { timestamps: true }
);

export default mongoose.models.Employer ||
  mongoose.model("Employer", employerSchema);
