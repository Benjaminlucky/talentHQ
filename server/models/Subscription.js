// models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userModel: { type: String, enum: ["Employer", "Jobnode"], required: true },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    planName: { type: String, required: true }, // denormalised for fast reads

    // Paystack
    paystackRef: { type: String, default: "" }, // payment reference
    paystackSubscriptionCode: { type: String, default: "" },

    // Billing cycle
    interval: {
      type: String,
      enum: ["monthly", "yearly", "one_time"],
      default: "monthly",
    },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "pending",
      index: true,
    },

    // Usage counters — reset each billing cycle
    usage: {
      jobsPosted: { type: Number, default: 0 },
      boostCreditsUsed: { type: Number, default: 0 },
      candidateUnlocks: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// One active subscription per user
subscriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
