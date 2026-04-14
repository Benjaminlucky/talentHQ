// scripts/seedPlans.js
// Run with: node scripts/seedPlans.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Plan from "../models/Plan.js";

const PLANS = [
  // ── EMPLOYER PLANS ──────────────────────────────────────────────────────────
  {
    name: "employer_free",
    displayName: "Free",
    targetRole: "employer",
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      jobPostLimit: 2,
      boostCredits: 0,
      candidateUnlocks: 5,
      featuredBadge: false,
      analyticsAccess: false,
    },
    active: true,
    sortOrder: 1,
  },
  {
    name: "employer_starter",
    displayName: "Starter",
    targetRole: "employer",
    priceMonthly: 1500000, // ₦15,000/mo in kobo
    priceYearly: 15000000, // ₦150,000/yr in kobo
    features: {
      jobPostLimit: 10,
      boostCredits: 2,
      candidateUnlocks: 30,
      featuredBadge: false,
      analyticsAccess: true,
    },
    active: true,
    sortOrder: 2,
  },
  {
    name: "employer_pro",
    displayName: "Pro",
    targetRole: "employer",
    priceMonthly: 3500000, // ₦35,000/mo
    priceYearly: 35000000, // ₦350,000/yr
    features: {
      jobPostLimit: -1,
      boostCredits: 10,
      candidateUnlocks: -1,
      featuredBadge: true,
      analyticsAccess: true,
    },
    active: true,
    sortOrder: 3,
  },

  // ── JOBSEEKER PLANS ─────────────────────────────────────────────────────────
  {
    name: "jobseeker_free",
    displayName: "Free",
    targetRole: "jobseeker",
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      priorityBadge: false,
      profileAnalytics: false,
      resumeBoost: false,
    },
    active: true,
    sortOrder: 1,
  },
  {
    name: "jobseeker_premium",
    displayName: "Premium",
    targetRole: "jobseeker",
    priceMonthly: 500000, // ₦5,000/mo
    priceYearly: 5000000, // ₦50,000/yr
    features: {
      priorityBadge: true,
      profileAnalytics: true,
      resumeBoost: true,
    },
    active: true,
    sortOrder: 2,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const plan of PLANS) {
    await Plan.findOneAndUpdate({ name: plan.name }, plan, {
      upsert: true,
      new: true,
    });
    console.log(`✅ Plan upserted: ${plan.displayName} (${plan.targetRole})`);
  }
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
