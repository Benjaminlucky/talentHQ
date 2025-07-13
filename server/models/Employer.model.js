import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  industry: { type: String, required: true },
  companySize: { type: String, required: true },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  address: { type: String, required: true },
  companyEmail: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  website: String,
  linkedin: String,
  cacNumber: String,
  password: { type: String, required: true },
  logo: String, // Base64 string

  contactPersonName: { type: String, required: true },
  contactPersonDesignation: { type: String, required: true },
  contactPersonEmail: { type: String, required: true },
  contactPersonPhone: { type: String, required: true },

  agreeToTerms: { type: Boolean, required: true },
  refreshToken: { type: String },
});

const EmployerModel = mongoose.model("Employer", employerSchema);
export default EmployerModel;
