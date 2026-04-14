"use client";

import { Star } from "lucide-react";

/**
 * PremiumBadge — shown on jobseeker application cards visible to employers.
 * Only renders when the jobseeker has an active premium subscription.
 *
 * Props:
 *   isPremium: boolean
 *   size?: "sm" | "md"
 */
export default function PremiumBadge({ isPremium, size = "md" }) {
  if (!isPremium) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
        size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
      }`}
    >
      <Star
        size={size === "sm" ? 8 : 10}
        className="fill-amber-500 text-amber-500 flex-shrink-0"
      />
      Premium
    </span>
  );
}
