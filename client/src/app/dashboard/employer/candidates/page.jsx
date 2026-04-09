"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Search,
  X,
  MapPin,
  Briefcase,
  Code2,
  GraduationCap,
  Award,
  Globe,
  Linkedin,
  Github,
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  MessageSquare,
  Users,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 bg-gray-100 rounded-xl" />
        <div className="h-8 flex-1 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-lime-50 text-lime-700 border-lime-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

// ── Interview modal ───────────────────────────────────────────────────────────
function InterviewModal({ applicationId, candidateName, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: `Interview with ${candidateName}`,
    date: "",
    time: "10:00",
    format: "video",
    location: "",
    platform: "Google Meet",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const INP =
    "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition";

  const submit = async (e) => {
    e.preventDefault();
    if (!form.date) {
      setError("Please select a date");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/interviews`,
        { ...form, applicationId },
        { withCredentials: true },
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Schedule Interview</h2>
            <p className="text-xs text-gray-500 mt-0.5">with {candidateName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className={INP}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <Calendar
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className={`${INP} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Time *
              </label>
              <div className="relative">
                <Clock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                  className={`${INP} pl-9`}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "video", l: "Video", i: Video },
                { v: "phone", l: "Phone", i: Phone },
                { v: "in-person", l: "In Person", i: Building2 },
              ].map(({ v, l, i: Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, format: v }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition ${
                    form.format === v
                      ? "border-lime-500 bg-lime-50 text-lime-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon size={15} />
                  {l}
                </button>
              ))}
            </div>
          </div>
          {form.format === "video" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Platform
              </label>
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm((p) => ({ ...p, platform: e.target.value }))
                }
                className={`${INP} cursor-pointer appearance-none`}
              >
                {[
                  "Google Meet",
                  "Zoom",
                  "Microsoft Teams",
                  "WhatsApp Video",
                  "Other",
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
          {(form.format === "video" || form.format === "in-person") && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {form.format === "video" ? "Meeting Link" : "Address"}
              </label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder={
                  form.format === "video"
                    ? "https://meet.google.com/..."
                    : "Office address"
                }
                className={INP}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Bring your portfolio, 45-minute session..."
              className={`${INP} resize-none`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Scheduling…
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  Schedule
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Candidate card ────────────────────────────────────────────────────────────
function CandidateCard({ app, onView }) {
  const name = app.jobseeker?.fullName || "Candidate";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const location =
    typeof app.jobseeker?.location === "object"
      ? [app.jobseeker.location.city, app.jobseeker.location.country]
          .filter(Boolean)
          .join(", ")
      : app.jobseeker?.location || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md p-5 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        {app.jobseeker?.avatar ? (
          <img
            src={app.jobseeker.avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS[app.status] || STATUS.pending}`}
            >
              {app.status}
            </span>
          </div>
          {app.jobseeker?.headline && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {app.jobseeker.headline}
            </p>
          )}
          {location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} />
              {location}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs font-semibold text-primary-600 mb-1">
        {app.roleTitle}
      </p>
      {app.coverLetter && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {app.coverLetter}
        </p>
      )}

      <button
        onClick={() => onView(app)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs rounded-xl transition"
      >
        View Full Profile <ChevronRight size={13} />
      </button>
    </motion.div>
  );
}

// ── Candidate drawer ──────────────────────────────────────────────────────────
function CandidateDrawer({ app, onClose, onStatusUpdate, onNotify }) {
  const [showInterview, setShowInterview] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [status, setStatus] = useState(app.status);

  const js = app.jobseeker || {};
  const name = js.fullName || "Candidate";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    typeof js.location === "object"
      ? [js.location.area, js.location.city, js.location.country]
          .filter(Boolean)
          .join(", ")
      : js.location || "";

  const handleHire = async () => {
    setHiring(true);
    try {
      await axios.put(
        `${API}/api/profile/applications/${app._id}/status`,
        {
          status: "accepted",
          employerMessage:
            "Congratulations! We'd love to have you join our team. Please expect a formal offer letter shortly.",
        },
        { withCredentials: true },
      );
      setStatus("accepted");
      onStatusUpdate(app._id, "accepted");
      onNotify("Candidate hired successfully! ✓");
    } catch (err) {
      onNotify(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    } finally {
      setHiring(false);
    }
  };

  const handleMessage = async () => {
    try {
      await axios.post(
        `${API}/api/messages/conversations`,
        { recipientId: js._id, recipientRole: "jobseeker" },
        { withCredentials: true },
      );
      onNotify("Conversation started — check Messages");
    } catch (err) {
      onNotify("Failed to start conversation", "error");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-gray-50 shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {js.avatar ? (
              <img
                src={js.avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
            <div>
              <p className="font-black text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-400">{app.roleTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS[status] || STATUS.pending}`}
            >
              {status}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Action buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowInterview(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition"
              >
                <Calendar size={13} /> Schedule Interview
              </button>
              <button
                onClick={handleHire}
                disabled={hiring || status === "accepted"}
                className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-xl transition ${
                  status === "accepted"
                    ? "bg-lime-100 text-lime-700 cursor-default"
                    : "bg-lime-600 hover:bg-lime-700 text-white disabled:opacity-60"
                }`}
              >
                {hiring ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UserCheck size={13} />
                )}
                {status === "accepted" ? "Hired ✓" : "Hire"}
              </button>
              <button
                onClick={handleMessage}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition"
              >
                <MessageSquare size={13} /> Message
              </button>
            </div>
          </div>

          {/* Profile info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Profile</h3>
            {js.headline && (
              <p className="font-medium text-gray-800 text-sm">{js.headline}</p>
            )}
            {js.tagline && (
              <p className="text-xs text-gray-500 italic mt-0.5 mb-3">
                {js.tagline}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
              {locationStr && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {locationStr}
                </span>
              )}
              {js.email && <span>{js.email}</span>}
              {js.linkedin && (
                <a
                  href={js.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Linkedin size={10} />
                  LinkedIn
                </a>
              )}
              {js.github && (
                <a
                  href={js.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-700 hover:underline"
                >
                  <Github size={10} />
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Cover letter */}
          {app.coverLetter && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                Cover Letter
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line border-l-4 border-lime-400 pl-4 italic">
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* Skills */}
          {js.skill?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Code2 size={13} className="text-lime-600" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {js.skill.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full border border-lime-100"
                  >
                    {s.name || s}
                    {s.level ? ` · ${s.level}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work experience */}
          {js.workExperience?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <Briefcase size={13} className="text-lime-600" />
                Experience
              </h3>
              <div className="space-y-4">
                {js.workExperience.map((w, i) => (
                  <div
                    key={i}
                    className={
                      i < js.workExperience.length - 1
                        ? "pb-4 border-b border-gray-100"
                        : ""
                    }
                  >
                    <p className="font-bold text-gray-900 text-sm">
                      {w.jobTitle || w.title}
                    </p>
                    <p className="text-xs text-gray-500">{w.company}</p>
                    <p className="text-xs text-gray-400">
                      {w.startDate?.slice(0, 7)} —{" "}
                      {w.endDate ? w.endDate.slice(0, 7) : "Present"}
                    </p>
                    {w.description && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {w.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {js.education?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <GraduationCap size={13} className="text-lime-600" />
                Education
              </h3>
              <div className="space-y-3">
                {js.education.map((e, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {e.degree}
                      </p>
                      <p className="text-xs text-gray-500">{e.institution}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {e.graduationYear ||
                        (e.graduationDate
                          ? new Date(e.graduationDate).getFullYear()
                          : "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {js.certifications?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Award size={13} className="text-lime-600" />
                Certifications
              </h3>
              <div className="space-y-2">
                {js.certifications.map((c, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-500">{c.organization}</p>
                    </div>
                    {c.dateEarned && (
                      <p className="text-xs text-gray-400">
                        {new Date(c.dateEarned).getFullYear()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {js.projects?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Globe size={13} className="text-lime-600" />
                Projects
              </h3>
              {js.projects.map((p, i) => (
                <div key={i} className="mb-2">
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-lime-700 hover:underline flex items-center gap-1"
                    >
                      <Globe size={11} />
                      {p.title}
                    </a>
                  ) : (
                    <p className="font-semibold text-sm text-gray-900">
                      {p.title}
                    </p>
                  )}
                  {p.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Interview modal on top of drawer */}
      <AnimatePresence>
        {showInterview && (
          <InterviewModal
            applicationId={app._id}
            candidateName={name}
            onClose={() => setShowInterview(false)}
            onSuccess={() => {
              setShowInterview(false);
              onNotify("Interview scheduled! ✓");
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EmployerCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toast, setToast] = useState(null);
  const [total, setTotal] = useState(0);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await axios.get(`${API}/api/profile/applications`, {
        params,
        withCredentials: true,
      });
      const list = res.data.applications || res.data || [];
      setCandidates(Array.isArray(list) ? list : []);
      setTotal(res.data.total || list.length);
    } catch {
      notify("Failed to load candidates", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchCandidates, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCandidates]);

  const openDetail = async (app) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API}/api/profile/applications/${app._id}`);
      setSelected(res.data);
    } catch {
      notify("Failed to load candidate details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)),
    );
  };

  const STATUS_TABS = ["all", "pending", "reviewed", "accepted", "rejected"];
  const counts = STATUS_TABS.reduce(
    (acc, s) => ({
      ...acc,
      [s]:
        s === "all"
          ? candidates.length
          : candidates.filter((c) => c.status === s).length,
    }),
    {},
  );

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="space-y-6 max-w-6xl">
        <AnimatePresence>
          {toast && <Toast message={toast.msg} type={toast.type} />}
        </AnimatePresence>
        {loadingDetail && (
          <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-5 flex items-center gap-3 shadow-xl">
              <Loader2 size={20} className="animate-spin text-lime-600" />
              <span className="text-sm font-semibold text-gray-700">
                Loading profile…
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Browse Candidates
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} candidate{total !== 1 ? "s" : ""} in the talent pool
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={16} className="text-primary-500" />
            <span className="font-bold text-xl text-primary-600">
              {counts.all}
            </span>{" "}
            total
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or headline…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === s
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">
              No candidates found
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "No applications have been submitted yet."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((app) => (
                <CandidateCard key={app._id} app={app} onView={openDetail} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Candidate drawer */}
        <AnimatePresence>
          {selected && (
            <CandidateDrawer
              app={selected}
              onClose={() => setSelected(null)}
              onStatusUpdate={handleStatusUpdate}
              onNotify={notify}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
