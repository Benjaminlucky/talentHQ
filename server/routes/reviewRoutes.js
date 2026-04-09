// routes/reviewRoutes.js
import express from "express";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  hideReview,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
// GET /api/reviews/:subjectModel/:subjectId
// subjectModel: "employer" | "handyman"
// ?page=1&limit=10&sort=newest|highest|lowest
router.get("/:subjectModel/:subjectId", getReviews);

// ── Authenticated ─────────────────────────────────────────────────────────────
// Reviews the current user has written
router.get("/me", verifyToken, getMyReviews);

// Submit a new review
router.post("/:subjectModel/:subjectId", verifyToken, createReview);

// Edit own review
router.put("/:reviewId", verifyToken, updateReview);

// Delete own review (or admin deletes any)
router.delete("/:reviewId", verifyToken, deleteReview);

// Superadmin: hide without deleting
router.patch("/:reviewId/hide", verifyToken, hideReview);

export default router;
