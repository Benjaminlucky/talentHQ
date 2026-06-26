// server/models/HandymanPortfolio.js
import mongoose from "mongoose";

const handymanPortfolioSchema = new mongoose.Schema(
  {
    handyman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Handyman",
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500, default: "" },
    imageUrl: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { timestamps: true },
);

handymanPortfolioSchema.index({ handyman: 1, createdAt: -1 });

export default mongoose.models.HandymanPortfolio ||
  mongoose.model("HandymanPortfolio", handymanPortfolioSchema);
