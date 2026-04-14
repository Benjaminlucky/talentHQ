"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ExternalLink, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

/**
 * AdSlot — renders a live ad for a placement zone.
 * Props:
 *   zone: "sidebar" | "feed_inline" | "feed_top" | "findjob_banner"
 *   className?: string
 */
export default function AdSlot({ zone, className = "" }) {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/api/payments/ads/active`, { params: { zone } })
      .then((res) => {
        const ads = res.data.ads || [];
        if (ads.length) setAd(ads[Math.floor(Math.random() * ads.length)]);
      })
      .catch(() => {});
  }, [zone]);

  if (!ad || dismissed) return null;

  const handleClick = () => {
    // Track click fire-and-forget
    axios.post(`${API}/api/payments/ads/${ad._id}/click`).catch(() => {});
    window.open(ad.linkUrl, "_blank", "noopener noreferrer");
  };

  return (
    <div className={`relative group ${className}`}>
      <div
        onClick={handleClick}
        className="cursor-pointer border border-gray-100 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
      >
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-24 object-cover"
          />
        )}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-xs truncate">
                {ad.title}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                {ad.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[9px] text-gray-300 uppercase tracking-widest">
              Sponsored
            </span>
            <span className="flex items-center gap-1 text-[11px] text-primary-600 font-bold hover:underline">
              {ad.ctaText} <ExternalLink size={9} />
            </span>
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        className="absolute top-2 right-2 w-5 h-5 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-full items-center justify-center hidden group-hover:flex transition"
        title="Dismiss ad"
      >
        <X size={10} />
      </button>
    </div>
  );
}
