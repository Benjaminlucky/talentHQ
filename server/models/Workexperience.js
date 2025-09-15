import mongoose from "mongoose";

const workExperience = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobnode",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.workExperience ||
  mongoose.model("workExperience", workExperience);
