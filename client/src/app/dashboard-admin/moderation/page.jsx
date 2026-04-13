"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import {
  Flag,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  ExternalLink,
  Clock,
  Filter,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  actioned: "bg-lime-50 text-lime-700 border-lime-200",
  dismissed: "bg-gray-100 text-gray-500 border-gray-200",
};

const REASON_LABELS = {
  fraudulent_job: "Fraudulent job posting",
  misleading_info: "Misleading information",
  inappropriate_content: "Inappropriate content",
  fake_profile: "Fake profile",
  spam: "Spam",
  harassment: "Harassment",
  false_review: "False review",
  defamatory_review: "Defamatory review",
  other: "Other",
};

const TARGET_LINKS = {
  job: (id) => `/findjob/${id}`,
  employer: (id) => `/employers/${id}`,
  handyman: (id) => `/handymen/${id}`,
  review: () => null,
};

function Toast({ message, type }) {
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
        type === "error" ? "bg-red-600 text-white" : "bg-lime-600 text-white"
      }`}
    >
      {type === "error" ? (
        <AlertCircle size={15} />
      ) : (
        <CheckCircle2 size={15} />
      )}
      {message}
    </div>
  );
}

function FlagCard({ flag, onResolve }) {
  const [expanding, setExpanding] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const targetLink = TARGET_LINKS[flag.targetType]?.(flag.targetId);

  const handleResolve = async (status) => {
    setLoading(true);
    await onResolve(flag._id, status, note);
    setLoading(false);
    setExpanding(false);
  };

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-sm ${
        flag.status === "pending"
          ? "border-amber-200 border-l-4 border-l-amber-400"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">
              {flag.targetType}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[flag.status]}`}
            >
              {flag.status}
            </span>
          </div>
          <p className="font-bold text-gray-900 text-sm">
            {REASON_LABELS[flag.reason] || flag.reason}
          </p>
          {flag.details && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
              {flag.details}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
            <Clock size={9} />
            {new Date(flag.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
            {flag.reporterRole}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {targetLink && (
          <Link
            href={targetLink}
            target="_blank"
            className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline"
          >
            <ExternalLink size={11} /> View {flag.targetType}
          </Link>
        )}
        {flag.targetType === "review" && (
          <span className="text-xs text-gray-400">
            Review ID: {flag.targetId?.toString().slice(-8)}
          </span>
        )}
      </div>

      {flag.adminNote && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100">
          <span className="font-semibold text-gray-700">Admin note:</span>{" "}
          {flag.adminNote}
        </div>
      )}

      {flag.status === "pending" && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!expanding ? (
            <div className="flex gap-2">
              <button
                onClick={() => setExpanding(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 font-semibold text-xs rounded-xl hover:bg-primary-100 transition"
              >
                <Shield size={12} /> Resolve
              </button>
              <button
                onClick={() => handleResolve("dismissed")}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <XCircle size={12} />
                )}
                Dismiss
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional admin note (e.g. action taken, reason for dismissal)..."
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolve("actioned")}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-lime-600 hover:bg-lime-700 text-white font-semibold text-xs rounded-xl transition disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}
                  Mark Actioned
                </button>
                <button
                  onClick={() => handleResolve("reviewed")}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition disabled:opacity-50"
                >
                  <Eye size={12} /> Mark Reviewed
                </button>
                <button
                  onClick={() => handleResolve("dismissed")}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <XCircle size={12} /> Dismiss
                </button>
                <button
                  onClick={() => setExpanding(false)}
                  className="px-3 py-2 text-gray-400 text-xs hover:text-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModerationPage() {
  const isAuthorized = useSuperAdminAuthRedirect();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatus] = useState("pending");
  const [typeFilter, setType] = useState("all");
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const params = { status: statusFilter };
      if (typeFilter !== "all") params.targetType = typeFilter;
      const res = await axios.get(`${API}/api/flags`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setFlags(res.data.flags || []);
      setTotal(res.data.total || 0);
    } catch {
      notify("Failed to load flags", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (isAuthorized) fetchFlags();
  }, [fetchFlags, isAuthorized]);

  const handleResolve = async (id, status, adminNote) => {
    try {
      const token = localStorage.getItem("superadminToken");
      await axios.patch(
        `${API}/api/flags/${id}/resolve`,
        { status, adminNote },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      setFlags((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status, adminNote } : f)),
      );
      notify(`Flag marked as ${status}`);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to resolve flag", "error");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS = ["pending", "reviewed", "actioned", "dismissed", "all"];
  const TYPES = ["all", "job", "employer", "handyman", "review"];

  const pendingCount = flags.filter((f) => f.status === "pending").length;

  return (
    <div className="max-w-4xl space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Flag size={22} className="text-red-500" /> Content Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} report{total !== 1 ? "s" : ""} · {pendingCount} pending
            review
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
              statusFilter === s
                ? "bg-primary-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s}{" "}
            {s === "pending" && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Filter size={13} className="text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition capitalize ${
                typeFilter === t
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Flags list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Sk key={i} className="h-40" />
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <Flag size={24} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">No reports</h3>
          <p className="text-sm text-gray-400">
            {statusFilter === "pending"
              ? "No pending reports to review."
              : `No ${statusFilter} reports.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <FlagCard key={flag._id} flag={flag} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  );
}
