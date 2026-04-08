import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "account_support",
        "job_posting",
        "application_help",
        "billing",
        "partnership",
        "report_fraud",
        "feedback",
        "other",
      ],
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["unread", "read", "resolved", "spam"],
      default: "unread",
    },
    ip: { type: String, default: "" },
  },
  { timestamps: true },
);

// Index for admin queries
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ category: 1 });

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);
