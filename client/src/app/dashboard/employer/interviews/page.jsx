"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  MapPin,
  Trash2,
  Edit2,
  X,
  User,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const FORMAT_ICON = { video: Video, phone: Phone, "in-person": Building2 };
const FORMAT_LABEL = {
  video: "Video Call",
  phone: "Phone Call",
  "in-person": "In Person",
};

const STATUS_COLORS = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-lime-50 text-lime-700 border-lime-200",
  rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

const RESPONSE_COLORS = {
  pending: "text-amber-600",
  accepted: "text-lime-600",
  declined: "text-red-500",
};

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
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
    </motion.div>
  );
}

function InterviewCard({ interview, onDelete, onComplete }) {
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const FormatIcon = FORMAT_ICON[interview.format] || Video;
  const isPast = new Date(interview.date) < new Date();
  const candidate = interview.jobseekerId;
  const initials = (candidate?.fullName || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDelete = async () => {
    if (!confirm("Cancel this interview?")) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/interviews/${interview._id}`, {
        withCredentials: true,
      });
      onDelete(interview._id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel");
    } finally {
      setDeleting(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await axios.put(
        `${API}/api/interviews/${interview._id}`,
        { status: "completed" },
        { withCredentials: true },
      );
      onComplete(interview._id);
    } catch {
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-all ${
        interview.status === "cancelled"
          ? "border-gray-100 opacity-60"
          : "border-gray-100 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {candidate?.avatar ? (
            <img
              src={candidate.avatar}
              alt={candidate.fullName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">
              {candidate?.fullName || "Candidate"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {interview.applicationId?.roleTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[interview.status] || STATUS_COLORS.scheduled}`}
          >
            {interview.status}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-3">
        {interview.title}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-gray-400" />
          {new Date(interview.date).toLocaleDateString("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400" />
          {interview.time}
        </div>
        <div className="flex items-center gap-1.5">
          <FormatIcon size={12} className="text-gray-400" />
          {FORMAT_LABEL[interview.format] || interview.format}
          {interview.platform && ` · ${interview.platform}`}
        </div>
        {interview.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-gray-400" />
            <span className="truncate">{interview.location.slice(0, 30)}</span>
          </div>
        )}
      </div>

      {/* Candidate response */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-400">Candidate response:</span>
          <span
            className={`font-bold capitalize ${RESPONSE_COLORS[interview.candidateResponse] || "text-gray-500"}`}
          >
            {interview.candidateResponse === "pending"
              ? "⏳ Awaiting"
              : interview.candidateResponse === "accepted"
                ? "✓ Accepted"
                : "✗ Declined"}
          </span>
        </div>
      </div>

      {interview.notes && (
        <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 mb-4 line-clamp-2">
          {interview.notes}
        </p>
      )}

      {/* Actions */}
      {interview.status !== "cancelled" && interview.status !== "completed" && (
        <div className="flex gap-2">
          {isPast && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-lime-600 hover:bg-lime-700 text-white font-semibold text-xs rounded-xl transition disabled:opacity-60"
            >
              {completing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle2 size={12} />
              )}
              Mark Complete
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 font-semibold text-xs rounded-xl hover:bg-red-50 transition disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axios
      .get(`${API}/api/interviews/employer`, { withCredentials: true })
      .then((res) => setInterviews(res.data.interviews || []))
      .catch(() => notify("Failed to load interviews", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    setInterviews((prev) => prev.filter((i) => i._id !== id));
    notify("Interview cancelled");
  };

  const handleComplete = (id) => {
    setInterviews((prev) =>
      prev.map((i) => (i._id === id ? { ...i, status: "completed" } : i)),
    );
    notify("Marked as completed ✓");
  };

  const FILTERS = [
    "all",
    "scheduled",
    "confirmed",
    "rescheduled",
    "completed",
    "cancelled",
  ];
  const filtered =
    filter === "all"
      ? interviews
      : interviews.filter((i) => i.status === filter);
  const upcoming = interviews.filter(
    (i) => new Date(i.date) >= new Date() && i.status !== "cancelled",
  ).length;

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="space-y-6 max-w-4xl">
        <AnimatePresence>
          {toast && <Toast message={toast.msg} type={toast.type} />}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Interviews</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {upcoming} upcoming interview{upcoming !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                filter === f
                  ? "bg-primary-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {f === "all"
                ? `All (${interviews.length})`
                : `${f.charAt(0).toUpperCase() + f.slice(1)} (${interviews.filter((i) => i.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Sk key={i} className="h-52" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">
              No interviews{" "}
              {filter !== "all" ? `with status "${filter}"` : "scheduled yet"}
            </h3>
            <p className="text-sm text-gray-400">
              Schedule interviews from the Candidates page
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((iv) => (
              <InterviewCard
                key={iv._id}
                interview={iv}
                onDelete={handleDelete}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
