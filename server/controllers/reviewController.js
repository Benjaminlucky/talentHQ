// controllers/reviewController.js
import Review from "../models/Review.js";
import Employer from "../models/Employer.js";
import Handyman from "../models/Handyman.js";
import Jobnode from "../models/Jobnode.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const MODEL_MAP = {
  employer: { Model: Employer, modelName: "Employer" },
  handyman: { Model: Handyman, modelName: "Handyman" },
};

const REVIEWER_MODEL = {
  jobseeker: { Model: Jobnode, modelName: "Jobnode" },
  employer: { Model: Employer, modelName: "Employer" },
  handyman: { Model: Handyman, modelName: "Handyman" },
};

// Recompute and cache the avg rating + count on the subject document
// so we can sort/filter by it cheaply in other queries.
async function syncRatingCache(subjectId, subjectModel) {
  const [result] = await Review.aggregate([
    { $match: { subjectId, hidden: false } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = result ? Math.round(result.avgRating * 10) / 10 : 0;
  const reviewCount = result?.reviewCount || 0;

  const ModelEntry = Object.values(MODEL_MAP).find(
    (m) => m.modelName === subjectModel,
  );
  if (ModelEntry) {
    await ModelEntry.Model.findByIdAndUpdate(subjectId, {
      avgRating,
      reviewCount,
    });
  }
}

// ── GET /api/reviews/:subjectModel/:subjectId ──────────────────────────────────
// Public — lists all visible reviews for an employer or handyman
export const getReviews = async (req, res) => {
  try {
    const { subjectModel, subjectId } = req.params;
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    if (!MODEL_MAP[subjectModel]) {
      return res.status(400).json({
        message: "Invalid subject type. Use 'employer' or 'handyman'.",
      });
    }

    const sortOrder =
      sort === "highest"
        ? { rating: -1, createdAt: -1 }
        : sort === "lowest"
          ? { rating: 1, createdAt: -1 }
          : { createdAt: -1 }; // newest (default)

    const modelName = MODEL_MAP[subjectModel].modelName;
    const query = { subjectId, subjectModel: modelName, hidden: false };

    const [reviews, total, agg] = await Promise.all([
      Review.find(query)
        .sort(sortOrder)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            dist: {
              $push: "$rating",
            },
          },
        },
      ]),
    ]);

    // Build rating distribution (1–5)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (agg[0]?.dist) {
      agg[0].dist.forEach((r) => {
        distribution[r] = (distribution[r] || 0) + 1;
      });
    }

    return res.json({
      reviews,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      avgRating: agg[0]?.avgRating ? Math.round(agg[0].avgRating * 10) / 10 : 0,
      distribution,
    });
  } catch (err) {
    console.error("❌ getReviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// ── POST /api/reviews/:subjectModel/:subjectId ─────────────────────────────────
// Authenticated — any logged-in user can review an employer or handyman
export const createReview = async (req, res) => {
  try {
    const { subjectModel, subjectId } = req.params;
    const { rating, title, body } = req.body;

    if (!MODEL_MAP[subjectModel]) {
      return res.status(400).json({ message: "Invalid subject type" });
    }

    // Validate subject exists
    const { Model: SubjectModel, modelName } = MODEL_MAP[subjectModel];
    const subject = await SubjectModel.findById(subjectId).lean();
    if (!subject) {
      return res.status(404).json({ message: `${subjectModel} not found` });
    }

    // Cannot review yourself
    if (req.user.id.toString() === subjectId.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    if (!body?.trim() || body.trim().length < 10) {
      return res
        .status(400)
        .json({ message: "Review must be at least 10 characters" });
    }

    // Fetch reviewer info for denormalized cache
    const { modelName: reviewerModelName } = REVIEWER_MODEL[req.user.role];
    const { Model: ReviewerModel } = REVIEWER_MODEL[req.user.role];
    const reviewer = await ReviewerModel.findById(req.user.id).lean();
    if (!reviewer) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    const review = await Review.create({
      subjectId,
      subjectModel: modelName,
      reviewerId: req.user.id,
      reviewerModel: reviewerModelName,
      reviewerName: reviewer.fullName || "Anonymous",
      reviewerAvatar: reviewer.avatar || "",
      reviewerRole: req.user.role,
      rating: Number(rating),
      title: title?.trim() || "",
      body: body.trim(),
    });

    // Update cached avg on subject
    await syncRatingCache(
      new (await import("mongoose")).default.Types.ObjectId(subjectId),
      modelName,
    );

    return res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message:
          "You have already reviewed this person. Edit or delete your existing review.",
      });
    }
    console.error("❌ createReview:", err);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

// ── PUT /api/reviews/:reviewId ─────────────────────────────────────────────────
// Authenticated — reviewer can edit their own review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.reviewerId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own reviews" });
    }

    const { rating, title, body } = req.body;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5)
        return res.status(400).json({ message: "Rating must be 1–5" });
      review.rating = Number(rating);
    }
    if (title !== undefined) review.title = title.trim();
    if (body !== undefined) {
      if (body.trim().length < 10)
        return res
          .status(400)
          .json({ message: "Review body must be at least 10 characters" });
      review.body = body.trim();
    }

    await review.save();
    await syncRatingCache(review.subjectId, review.subjectModel);

    return res.json({ message: "Review updated", review });
  } catch (err) {
    console.error("❌ updateReview:", err);
    res.status(500).json({ message: "Failed to update review" });
  }
};

// ── DELETE /api/reviews/:reviewId ──────────────────────────────────────────────
// Reviewer can delete their own; superadmin can delete any
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.reviewerId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this review" });
    }

    const { subjectId, subjectModel } = review;
    await review.deleteOne();
    await syncRatingCache(subjectId, subjectModel);

    return res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("❌ deleteReview:", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

// ── GET /api/reviews/me ────────────────────────────────────────────────────────
// Authenticated — get reviews left BY the current user
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewerId: req.user.id,
      hidden: false,
    })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ reviews });
  } catch (err) {
    console.error("❌ getMyReviews:", err);
    res.status(500).json({ message: "Failed to fetch your reviews" });
  }
};

// ── PATCH /api/reviews/:reviewId/hide ─────────────────────────────────────────
// Superadmin only — hide a review without deleting (audit trail)
export const hideReview = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Superadmin only" });
    }
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { hidden: true, hiddenReason: req.body.reason || "Moderated by admin" },
      { new: true },
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    await syncRatingCache(review.subjectId, review.subjectModel);
    return res.json({ message: "Review hidden", review });
  } catch (err) {
    console.error("❌ hideReview:", err);
    res.status(500).json({ message: "Failed to hide review" });
  }
};
