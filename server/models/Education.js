import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jobnode",
    required: true,
  },
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  graduationDate: { type: Date },
});

export default mongoose.models.Education ||
  mongoose.model("Education", educationSchema);
