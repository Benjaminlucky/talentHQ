import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobnode",
      required: true,
    },
    title: { type: String, required: true },
    link: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
