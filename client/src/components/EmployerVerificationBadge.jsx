"use client";

import { Shield, ShieldAlert, Info } from "lucide-react";
import { useState } from "react";

/**
 * EmployerVerificationBadge
 *
 * Props:
 *   cacNumber?:  string — the CAC number the employer declared (may be empty)
 *   size?:       "sm" | "md" (default "md")
 */
export default function EmployerVerificationBadge({ cacNumber, size = "md" }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const hasCac = !!cacNumber?.trim();

  const badge = hasCac ? (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold ${
        size === "sm"
          ? "text-[10px] bg-amber-50 text-amber-700 border-amber-200"
          : "text-xs bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      <ShieldAlert size={size === "sm" ? 10 : 12} />
      Self-declared CAC
    </div>
  ) : (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold ${
        size === "sm"
          ? "text-[10px] bg-gray-100 text-gray-500 border-gray-200"
          : "text-xs bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      <Shield size={size === "sm" ? 10 : 12} />
      Unverified
    </div>
  );

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1">
        {badge}
        <button
          type="button"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          onClick={() => setTooltipOpen((v) => !v)}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Verification info"
        >
          <Info size={12} />
        </button>
      </div>

      {tooltipOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl z-50 leading-relaxed">
          {hasCac ? (
            <>
              <p className="font-bold text-amber-300 mb-1">
                Self-declared CAC: {cacNumber}
              </p>
              <p>
                This employer has provided a CAC registration number, but
                TalentHQ does not verify it against any government registry.
                Always conduct your own due diligence before accepting any
                offer.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-gray-300 mb-1">Not verified</p>
              <p>
                This employer has not provided a CAC number. TalentHQ does not
                independently verify employer identities. Exercise caution and
                research any company before engaging.
              </p>
            </>
          )}
          <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
