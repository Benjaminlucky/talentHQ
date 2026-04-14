"use client";

import { Zap, Crown } from "lucide-react";

/**
 * FeaturedJobBadge — shown on job cards in listings.
 *
 * Props:
 *   featured: boolean — pinned/featured tier (Crown badge)
 *   boosted:  boolean — boosted tier (Zap badge)
 */
export default function FeaturedJobBadge({ featured, boosted }) {
  if (featured) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-primary-500 text-white">
        <Crown size={8} /> Featured
      </span>
    );
  }
  if (boosted) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-lime-500 text-white">
        <Zap size={8} /> Boosted
      </span>
    );
  }
  return null;
}
