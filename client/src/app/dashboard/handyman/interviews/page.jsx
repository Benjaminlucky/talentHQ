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
  MapPin,
  MessageSquare,
  X,
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

// ── Respond modal ─────────────────────────────────────────────────────────────
function RespondModal({ interview, onClose, onSuccess }) {
  const [response, setResponse] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!response) {
      setError("Please select a response");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.patch(
        `${API}/api/interviews/${interview._id}/respond`,
        { response, note },
        { withCredentials: true },
      );
      onSuccess(interview._id, response);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to respond");
    } finally {
      setLoading(false);
    }
  };

  const companyName =
    interview.employerId?.companyName ||
    interview.employerId?.fullName ||
    "Employer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Respond to Interview</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {interview.title} · {companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setResponse("accepted")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                response === "accepted"
                  ? "border-lime-500 bg-lime-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CheckCircle2
                size={22}
                className={
                  response === "accepted" ? "text-lime-600" : "text-gray-400"
                }
              />
              <span
                className={`font-bold text-sm ${response === "accepted" ? "text-lime-700" : "text-gray-600"}`}
              >
                Accept
              </span>
              <span className="text-xs text-gray-400 text-center">
                I'll attend this interview
              </span>
            </button>
            <button
              onClick={() => setResponse("declined")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                response === "declined"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <XCircle
                size={22}
                className={
                  response === "declined" ? "text-red-500" : "text-gray-400"
                }
              />
              <span
                className={`font-bold text-sm ${response === "declined" ? "text-red-600" : "text-gray-600"}`}
              >
                Decline
              </span>
              <span className="text-xs text-gray-400 text-center">
                I can't make this one
              </span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Add a note for the employer (optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                response === "declined"
                  ? "Thank you for the opportunity. Unfortunately, I have a conflict on that day..."
                  : "Looking forward to it! I'll send my portfolio ahead of time..."
              }
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={loading || !response}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-xl text-sm transition disabled:opacity-50 ${
                response === "declined"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-lime-600 hover:bg-lime-700 text-white"
              }`}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading
                ? "Sending…"
                : response === "declined"
                  ? "Decline Interview"
                  : "Accept Interview"}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Interview card ─────────────────────────────────────────────────────────────
function InterviewCard({ interview, onRespond }) {
  const FormatIcon = FORMAT_ICON[interview.format] || Video;
  const employer = interview.employerId;
  const companyName = employer?.companyName || employer?.fullName || "Employer";
  const initials = companyName.slice(0, 2).toUpperCase();
  const isPast = new Date(interview.date) < new Date();
  const responded = interview.candidateResponse !== "pending";

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-all ${
        interview.status === "cancelled"
          ? "border-gray-100 opacity-60"
          : "border-gray-100 hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {employer?.logo ? (
          <img
            src={employer.logo}
            alt={companyName}
            className="w-11 h-11 rounded-xl object-contain border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {interview.title}
            </h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[interview.status] || STATUS_COLORS.scheduled}`}
            >
              {interview.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{companyName}</p>
          {interview.applicationId?.roleTitle && (
            <p className="text-xs text-gray-400">
              for: {interview.applicationId.roleTitle}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-gray-400" />
          <span
            className={isPast ? "text-gray-400 line-through" : "font-medium"}
          >
            {new Date(interview.date).toLocaleDateString("en-NG", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
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
            <a
              href={
                interview.location.startsWith("http")
                  ? interview.location
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              className={
                interview.location.startsWith("http")
                  ? "text-blue-600 hover:underline truncate"
                  : "truncate"
              }
            >
              {interview.location.startsWith("http")
                ? "Join meeting"
                : interview.location.slice(0, 25)}
            </a>
          </div>
        )}
      </div>

      {interview.notes && (
        <div className="mb-4 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed border border-gray-100">
          <p className="font-semibold text-gray-500 mb-1">
            Note from employer:
          </p>
          {interview.notes}
        </div>
      )}

      {/* Response status + action */}
      {interview.status !== "cancelled" &&
        (responded ? (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              interview.candidateResponse === "accepted"
                ? "bg-lime-50 text-lime-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {interview.candidateResponse === "accepted" ? (
              <>
                <CheckCircle2 size={13} />
                You accepted this interview
              </>
            ) : (
              <>
                <XCircle size={13} />
                You declined this interview
              </>
            )}
          </div>
        ) : (
          !isPast && (
            <div className="flex gap-2">
              <button
                onClick={() => onRespond(interview)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition"
              >
                Respond to this invite
              </button>
            </div>
          )
        ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function JobseekerInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondTarget, setRespondTarget] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axios
      .get(`${API}/api/interviews/jobseeker`, { withCredentials: true })
      .then((res) => setInterviews(res.data.interviews || []))
      .catch(() => notify("Failed to load interviews", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleResponse = (id, response) => {
    setInterviews((prev) =>
      prev.map((i) =>
        i._id === id
          ? {
              ...i,
              candidateResponse: response,
              status: response === "accepted" ? "confirmed" : i.status,
            }
          : i,
      ),
    );
    setRespondTarget(null);
    notify(
      response === "accepted" ? "Interview accepted! ✓" : "Interview declined",
    );
  };

  const upcoming = interviews.filter(
    (i) => new Date(i.date) >= new Date() && i.status !== "cancelled",
  ).length;
  const pending = interviews.filter(
    (i) => i.candidateResponse === "pending" && i.status !== "cancelled",
  ).length;

  const FILTERS = [
    "all",
    "scheduled",
    "confirmed",
    "rescheduled",
    "cancelled",
    "completed",
  ];
  const filtered =
    filter === "all"
      ? interviews
      : interviews.filter((i) => i.status === filter);

  return (
    <ProtectedRoute allowedRoles={["jobseeker", "handyman"]}>
      <div className="space-y-6 max-w-4xl">
        <AnimatePresence>
          {toast && <Toast message={toast.msg} type={toast.type} />}
        </AnimatePresence>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Interview Invites
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {upcoming} upcoming · {pending} awaiting your response
            </p>
          </div>
          {pending > 0 && (
            <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-black">
              {pending}
            </div>
          )}
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
              <Sk key={i} className="h-56" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">
              No interview invites yet
            </h3>
            <p className="text-sm text-gray-400">
              When employers schedule interviews with you, they'll appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((iv) => (
              <InterviewCard
                key={iv._id}
                interview={iv}
                onRespond={setRespondTarget}
              />
            ))}
          </div>
        )}

        {/* Respond modal */}
        <AnimatePresence>
          {respondTarget && (
            <RespondModal
              interview={respondTarget}
              onClose={() => setRespondTarget(null)}
              onSuccess={handleResponse}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
