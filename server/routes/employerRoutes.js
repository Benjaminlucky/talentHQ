// routes/employerRoutes.js
// Adds a public /browse endpoint that the /companies page uses.
// All other existing routes are preserved exactly.
import express from "express";
import Employer from "../models/Employer.js";
import JobModel from "../models/job.model.js";

const router = express.Router();

// ── GET /api/employers/browse — public, paginated, searchable ─────────────────
router.get("/browse", async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", industry = "" } = req.query;

    const query = { onboardingComplete: true };
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }
    if (industry) query.industry = { $regex: industry, $options: "i" };

    const [employers, total] = await Promise.all([
      Employer.find(query)
        .select(
          "fullName companyName logo industry location companySize avgRating reviewCount createdAt",
        )
        .sort({ avgRating: -1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Employer.countDocuments(query),
    ]);

    // Count open jobs per employer in one aggregation
    const employerIds = employers.map((e) => e._id);
    const jobCountAgg = await JobModel.aggregate([
      {
        $match: {
          company: { $in: employerIds },
          $or: [{ status: "open" }, { status: { $exists: false } }],
        },
      },
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);

    res.json({
      employers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      jobCounts: jobCountAgg, // [{ _id: employerId, count: N }]
    });
  } catch (err) {
    console.error("❌ browseEmployers:", err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

export default router;
