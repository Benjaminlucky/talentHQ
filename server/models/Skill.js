import mongoose from "mongoose";
const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobnode",
      required: true,
    },
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Skill || mongoose.model("Skill", skillSchema);
