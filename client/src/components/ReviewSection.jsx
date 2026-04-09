"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Star,
  Edit2,
  Trash2,
  Loader2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Star display ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 16, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? hovered || rating : rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onRate(n) : undefined}
          onMouseEnter={interactive ? () => setHovered(n) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          className={
            interactive
              ? "cursor-pointer transition-transform hover:scale-110"
              : "cursor-default"
          }
          tabIndex={interactive ? 0 : -1}
          aria-label={
            interactive ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined
          }
        >
          <Star
            size={size}
            className={`transition-colors ${
              n <= display
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Average rating display ─────────────────────────────────────────────────────
function RatingSummary({ avgRating, total, distribution }) {
  const pct = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
      {/* Big number */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 sm:border-r sm:border-gray-200 sm:pr-6">
        <p className="text-5xl font-black text-gray-900">
          {avgRating.toFixed(1)}
        </p>
        <Stars rating={Math.round(avgRating)} size={20} />
        <p className="text-xs text-gray-400 mt-1.5">
          {total} review{total !== 1 ? "s" : ""}
        </p>
      </div>
      {/* Distribution bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => (
          <div
            key={star}
            className="flex items-center gap-2 text-xs text-gray-500"
          >
            <span className="w-3 text-right">{star}</span>
            <Star
              size={11}
              className="fill-amber-400 text-amber-400 flex-shrink-0"
            />
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${pct(distribution?.[star] || 0)}%` }}
              />
            </div>
            <span className="w-6 text-right text-gray-400">
              {distribution?.[star] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review form ───────────────────────────────────────────────────────────────
function ReviewForm({
  subjectModel,
  subjectId,
  existing,
  onSuccess,
  onCancel,
}) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [title, setTitle] = useState(existing?.title || "");
  const [body, setBody] = useState(existing?.body || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!existing;
  const inp =
    "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) {
      setError("Please select a star rating");
      return;
    }
    if (body.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(
          `${API}/api/reviews/${existing._id}`,
          { rating, title, body },
          { withCredentials: true },
        );
      } else {
        await axios.post(
          `${API}/api/reviews/${subjectModel}/${subjectId}`,
          { rating, title, body },
          { withCredentials: true },
        );
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-sm">
          {isEdit ? "Edit your review" : "Write a review"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Your Rating *
          </label>
          <Stars rating={rating} size={28} interactive onRate={setRating} />
          {rating > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            maxLength={120}
            className={inp}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Review *
          </label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share details about your experience..."
            maxLength={1500}
            className={`${inp} resize-none`}
          />
          <p className="text-right text-xs text-gray-400 mt-1">
            {body.length}/1500
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Submitting…
              </>
            ) : isEdit ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Single review card ─────────────────────────────────────────────────────────
function ReviewCard({ review, currentUserId, onEdit, onDelete, deleting }) {
  const isOwn =
    review.reviewerId === currentUserId ||
    review.reviewerId?._id === currentUserId;
  const initials =
    review.reviewerName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {review.reviewerAvatar ? (
            <img
              src={review.reviewerAvatar}
              alt={review.reviewerName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">
                {review.reviewerName}
              </p>
              {review.verified && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-lime-50 text-lime-700 rounded-full border border-lime-100 flex items-center gap-0.5">
                  <CheckCircle2 size={9} /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 capitalize">
              {review.reviewerRole}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Stars rating={review.rating} size={13} />
          {isOwn && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(review)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => onDelete(review._id)}
                disabled={deleting === review._id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              >
                {deleting === review._id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {review.title && (
        <p className="font-semibold text-gray-900 text-sm mb-1">
          {review.title}
        </p>
      )}
      <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(review.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────────
/**
 * Usage:
 *   <ReviewSection subjectModel="employer" subjectId={employer._id} />
 *   <ReviewSection subjectModel="handyman" subjectId={handyman._id} />
 *
 * subjectModel: "employer" | "handyman"
 * subjectId: MongoDB ObjectId string
 */
export default function ReviewSection({ subjectModel, subjectId }) {
  const { user } = useAuth();
  const [data, setData] = useState({
    reviews: [],
    total: 0,
    avgRating: 0,
    distribution: {},
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReviews = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/api/reviews/${subjectModel}/${subjectId}`,
        {
          params: { page, limit: 10, sort },
        },
      );
      setData(res.data);
    } catch {
      notify("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [subjectModel, subjectId, page, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    setDeleting(reviewId);
    try {
      await axios.delete(`${API}/api/reviews/${reviewId}`, {
        withCredentials: true,
      });
      notify("Review deleted");
      fetchReviews();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  // Has the current user already left a review?
  const myReview = user
    ? data.reviews.find(
        (r) => r.reviewerId === user._id || r.reviewerId?._id === user._id,
      )
    : null;

  // Can write if logged in, not the subject themselves, and hasn't reviewed yet
  const canReview = user && !myReview && !showForm && !editTarget;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-lime-600 text-white"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-lg">
          Reviews
          {data.total > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({data.total})
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          {/* Sort */}
          {data.total > 1 && (
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400 cursor-pointer appearance-none pr-8"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          )}

          {canReview && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Star size={12} className="fill-white" /> Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Rating summary */}
      {data.total > 0 && (
        <RatingSummary
          avgRating={data.avgRating}
          total={data.total}
          distribution={data.distribution}
        />
      )}

      {/* Write review form */}
      {showForm && !myReview && (
        <ReviewForm
          subjectModel={subjectModel}
          subjectId={subjectId}
          onSuccess={() => {
            setShowForm(false);
            fetchReviews();
            notify("Review submitted — thank you!");
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Login prompt */}
      {!user && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-500 mb-3">
            <a
              href="/login"
              className="font-semibold text-lime-700 hover:underline"
            >
              Log in
            </a>{" "}
            to leave a review
          </p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : data.reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
            <Star size={24} className="text-amber-400" />
          </div>
          <p className="font-bold text-gray-800 mb-1">No reviews yet</p>
          <p className="text-sm text-gray-400">
            {user
              ? "Be the first to leave a review."
              : "Log in to leave the first review."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review) =>
            editTarget?._id === review._id ? (
              <ReviewForm
                key={review._id}
                subjectModel={subjectModel}
                subjectId={subjectId}
                existing={editTarget}
                onSuccess={() => {
                  setEditTarget(null);
                  fetchReviews();
                  notify("Review updated");
                }}
                onCancel={() => setEditTarget(null)}
              />
            ) : (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?._id}
                onEdit={setEditTarget}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ),
          )}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
