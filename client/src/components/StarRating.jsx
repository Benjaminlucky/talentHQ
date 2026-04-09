"use client";
import { Star } from "lucide-react";

/**
 * Inline star rating display for cards and listings.
 * Usage:
 *   <StarRating rating={4.5} count={23} />
 *   <StarRating rating={3.2} />              (no count shown)
 *   <StarRating rating={0} count={0} empty="No reviews yet" />
 */
export default function StarRating({
  rating = 0,
  count,
  empty = null,
  size = 13,
}) {
  if ((!rating || rating === 0) && count === 0) {
    return empty ? (
      <span className="text-xs text-gray-400">{empty}</span>
    ) : null;
  }

  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty_stars = 5 - full - (half ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={`f${i}`}
            size={size}
            className="fill-amber-400 text-amber-400"
          />
        ))}
        {half && (
          <span className="relative inline-block">
            <Star size={size} className="fill-gray-200 text-gray-200" />
            <span className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={size} className="fill-amber-400 text-amber-400" />
            </span>
          </span>
        )}
        {Array.from({ length: Math.max(0, empty_stars) }).map((_, i) => (
          <Star
            key={`e${i}`}
            size={size}
            className="fill-gray-200 text-gray-200"
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-gray-700">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </span>
  );
}
