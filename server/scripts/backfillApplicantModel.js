// scripts/backfillApplicantModel.js
// One-time, idempotent migration. Run once after deploying the polymorphic
// application/interview models:  node scripts/backfillApplicantModel.js
//
// Why: the Applications and Interview collections became polymorphic — an
// applicant can now be a Jobnode (jobseeker) OR a Handyman. New documents set
// applicantModel / jobseekerModel automatically. Documents created BEFORE this
// change have neither field, so Mongoose would leave the applicant unpopulated
// (an employer would see a blank candidate on old rows).
//
// This backfills every legacy Applications doc with applicantModel="Jobnode" /
// applicantRole="jobseeker", and every legacy Interview doc with
// jobseekerModel="Jobnode" — correct, because all pre-existing applications
// were jobseekers. Safe to run multiple times: only touches docs missing the
// field.
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not set.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const apps = await db.collection("applications").updateMany(
    { applicantModel: { $exists: false } },
    { $set: { applicantModel: "Jobnode", applicantRole: "jobseeker" } },
  );
  console.log(`✅ Applications backfilled: ${apps.modifiedCount}`);

  const interviews = await db.collection("interviews").updateMany(
    { jobseekerModel: { $exists: false } },
    { $set: { jobseekerModel: "Jobnode" } },
  );
  console.log(`✅ Interviews backfilled: ${interviews.modifiedCount}`);

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
