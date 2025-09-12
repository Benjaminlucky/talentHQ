import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobnode",
      required: true,
    },
    title: { type: String, required: true },
    organization: { type: String, required: true },
    dateEarned: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Certification ||
  mongoose.model("Certification", certificationSchema);
