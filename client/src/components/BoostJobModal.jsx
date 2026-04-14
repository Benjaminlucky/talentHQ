"use client";

import { useState } from "react";
import axios from "axios";
import {
  Zap,
  Crown,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const DURATIONS = [
  { days: 7, label: "1 week", boost: 2000, featured: 5000 },
  { days: 14, label: "2 weeks", boost: 4000, featured: 10000 },
  { days: 30, label: "1 month", boost: 7500, featured: 18000 },
];

/**
 * BoostJobModal
 * Props: job (object), onClose (fn), onSuccess (fn)
 */
export default function BoostJobModal({ job, onClose, onSuccess }) {
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [isFeatured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const price = isFeatured ? duration.featured : duration.boost;

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${API}/api/payments/boost/initialize`,
        {
          jobId: job._id,
          durationDays: duration.days,
          featured: isFeatured,
        },
        { withCredentials: true },
      );

      // Redirect to Paystack
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to start payment. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <Zap size={16} className="text-lime-500" /> Boost Job Listing
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">
              {job.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle size={12} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Boost type */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFeatured(false)}
              className={`p-4 rounded-xl border-2 text-left transition ${!isFeatured ? "border-lime-400 bg-lime-50" : "border-gray-100 hover:border-gray-200"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Zap
                  size={13}
                  className={!isFeatured ? "text-lime-600" : "text-gray-400"}
                />
                <p
                  className={`font-bold text-sm ${!isFeatured ? "text-lime-700" : "text-gray-700"}`}
                >
                  Boost
                </p>
              </div>
              <p className="text-[11px] text-gray-500">
                Job appears higher in search results
              </p>
            </button>
            <button
              onClick={() => setFeatured(true)}
              className={`p-4 rounded-xl border-2 text-left transition ${isFeatured ? "border-primary-400 bg-primary-50" : "border-gray-100 hover:border-gray-200"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Crown
                  size={13}
                  className={isFeatured ? "text-primary-600" : "text-gray-400"}
                />
                <p
                  className={`font-bold text-sm ${isFeatured ? "text-primary-700" : "text-gray-700"}`}
                >
                  Featured
                </p>
              </div>
              <p className="text-[11px] text-gray-500">
                Pinned to top + Featured badge
              </p>
            </button>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              Duration
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.days}
                  onClick={() => setDuration(d)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition ${
                    duration.days === d.days
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">
                {isFeatured ? "Featured listing" : "Boost listing"}
              </span>
              <span className="font-black text-lg text-primary-600">
                ₦{price.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              for {duration.label} · auto-expires after {duration.days} days
            </p>
          </div>

          <div className="px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-[11px] text-amber-700 flex items-start gap-1.5 leading-relaxed">
              <Info size={11} className="flex-shrink-0 mt-0.5" />
              Boost activates immediately after Paystack payment confirmation.
              Your job will rank higher in search results for the selected
              duration.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Zap size={14} />
                Pay ₦{price.toLocaleString()}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
