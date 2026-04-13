"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Flag,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE;

const REASONS = {
  job: [
    { value: "fraudulent_job", label: "Fraudulent or scam job posting" },
    { value: "misleading_info", label: "Misleading job description or salary" },
    {
      value: "inappropriate_content",
      label: "Inappropriate or offensive content",
    },
    { value: "spam", label: "Spam or repeated posting" },
    { value: "other", label: "Other reason" },
  ],
  employer: [
    { value: "fake_profile", label: "Fake or impersonating company" },
    { value: "fraudulent_job", label: "Associated with fraudulent listings" },
    { value: "harassment", label: "Harassing users" },
    { value: "misleading_info", label: "Misleading company information" },
    { value: "other", label: "Other reason" },
  ],
  handyman: [
    { value: "fake_profile", label: "Fake or impersonating profile" },
    { value: "misleading_info", label: "False skills or certifications" },
    { value: "harassment", label: "Harassing users" },
    { value: "other", label: "Other reason" },
  ],
  review: [
    { value: "false_review", label: "Factually false or inaccurate" },
    { value: "defamatory_review", label: "Defamatory or malicious" },
    { value: "spam", label: "Spam or fake review" },
    { value: "inappropriate_content", label: "Inappropriate language" },
    { value: "other", label: "Other reason" },
  ],
};

/**
 * FlagButton — reusable report widget
 *
 * Props:
 *   targetType: "job" | "employer" | "handyman" | "review"
 *   targetId:   MongoDB ObjectId string
 *   label?:     button label (default "Report")
 *   compact?:   icon-only button
 */
export default function FlagButton({
  targetType,
  targetId,
  label = "Report",
  compact = false,
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reasons = REASONS[targetType] || REASONS.job;

  const handleOpen = () => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/flags`,
        { targetType, targetId, reason, details },
        { withCredentials: true },
      );
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-lime-700 font-semibold">
        <CheckCircle2 size={13} /> Reported — thank you
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center gap-1.5 transition text-gray-400 hover:text-red-500 ${
          compact
            ? "p-1.5 rounded-lg hover:bg-red-50"
            : "text-xs font-semibold hover:underline"
        }`}
        title="Report this content"
      >
        <Flag size={compact ? 13 : 11} />
        {!compact && <span>{label}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-black text-gray-900 text-sm">
                  Report Content
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Help us keep TalentHQ safe and trustworthy
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  What's wrong with this content? *
                </label>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition ${
                        reason === r.value
                          ? "border-primary-400 bg-primary-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-primary-500 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Additional details (optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context that may help our team review this report..."
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 resize-none"
                  maxLength={500}
                />
                <p className="text-right text-[10px] text-gray-400 mt-0.5">
                  {details.length}/500
                </p>
              </div>

              {/* Safe harbour notice */}
              <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">Note:</strong> Reports are
                  reviewed by our moderation team. False reporting may result in
                  action against your account. For legal notices, contact{" "}
                  <span className="text-primary-600">legal@talenthq.ng</span>.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !reason}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Flag size={14} />
                      Submit Report
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
