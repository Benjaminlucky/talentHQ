// controllers/statsController.js
import JobModel from "../models/job.model.js";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// Simple in-memory cache so the homepage doesn't hit the DB on every visit.
// Counts change slowly; a 5-minute cache is plenty and keeps this endpoint fast.
let _cache = null;
let _cacheAt = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

// ── GET /api/stats — public platform counts ──────────────────────────────────
export const getStats = async (req, res) => {
  try {
    if (_cache && Date.now() - _cacheAt < CACHE_MS) {
      return res.json(_cache);
    }

    // Active jobs = open jobs + legacy jobs with no status field (treated as open)
    const [activeJobs, jobseekers, handymen, employers] = await Promise.all([
      JobModel.countDocuments({
        $or: [{ status: "open" }, { status: { $exists: false } }],
      }),
      Jobnode.countDocuments({}),
      Handyman.countDocuments({}),
      Employer.countDocuments({}),
    ]);

    // Candidates = jobseekers + handymen (both are people looking for work)
    const candidates = jobseekers + handymen;

    const payload = {
      activeJobs,
      candidates,
      jobseekers,
      handymen,
      companies: employers,
      updatedAt: new Date().toISOString(),
    };

    _cache = payload;
    _cacheAt = Date.now();

    res.json(payload);
  } catch (err) {
    console.error("❌ getStats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
