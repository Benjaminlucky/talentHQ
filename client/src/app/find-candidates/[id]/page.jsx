"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Mail,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Globe,
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  UserCheck,
  ChevronRight,
  Lock,
  ArrowLeft,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

// ── Auth gate ─────────────────────────────────────────────────────────────────
function AuthGate({ message }) {
  const router = useRouter();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={36} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          Sign in required
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() =>
              router.push(
                `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
              )
            }
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition"
          >
            Log in <ChevronRight size={16} />
          </button>
          <Link
            href="/signup"
            className="flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition"
            >
              Try again
            </button>
          )}
          <Link
            href="/find-candidates"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Back to candidates
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Interview scheduler modal ──────────────────────────────────────────────────
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) {
      setError("Please select an interview date");
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
      setError(err.response?.data?.message || "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Schedule Interview</h2>
            <p className="text-xs text-gray-500 mt-0.5">for {candidateName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Interview Title
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
                  size={14}
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
                  size={14}
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
                { val: "video", label: "Video Call", icon: Video },
                { val: "phone", label: "Phone Call", icon: Phone },
                { val: "in-person", label: "In Person", icon: Building2 },
              ].map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, format: val }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition ${
                    form.format === val
                      ? "border-lime-500 bg-lime-50 text-lime-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.format === "video" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Meeting Platform
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
                {form.format === "video"
                  ? "Meeting Link"
                  : "Location / Address"}
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
              Notes for candidate (optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Please bring your portfolio, expect a 45-minute session..."
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
                  Schedule Interview
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
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <div
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
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CandidateDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [relatedApplications, setRelatedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInterview, setShowInterview] = useState(false);
  const [hiringId, setHiringId] = useState(false);
  const [toast, setToast] = useState(null);

  const baseUrl = API;
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCandidate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/profile/applications/${id}`);
      if (!res.ok)
        throw new Error(
          res.status === 404
            ? "Candidate not found"
            : "Failed to load candidate",
        );
      const data = await res.json();
      setCandidate(data);
      if (data?.jobseeker?._id) {
        const rel = await fetch(`${baseUrl}/api/profile/applications?limit=5`);
        if (rel.ok) {
          const relData = await rel.json();
          setRelatedApplications(
            (relData.applications || relData)
              .filter((a) => a._id !== id)
              .slice(0, 4),
          );
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  const handleHire = async () => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    if (user.role !== "employer") {
      notify("Only employers can hire candidates", "error");
      return;
    }
    setHiringId(true);
    try {
      await axios.put(
        `${baseUrl}/api/profile/applications/${id}/status`,
        {
          status: "accepted",
          employerMessage:
            "Congratulations! We would like to offer you this position. Please expect a formal offer letter.",
        },
        { withCredentials: true },
      );
      setCandidate((p) => ({ ...p, status: "accepted" }));
      notify("Candidate hired! They will be notified.");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setHiringId(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    try {
      await axios.post(
        `${baseUrl}/api/messages/conversations`,
        { recipientId: candidate.jobseeker._id, recipientRole: "jobseeker" },
        { withCredentials: true },
      );
      router.push(`/dashboard/${user.role}/messages`);
    } catch (err) {
      notify("Failed to start conversation", "error");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100">
          <Sk className="w-24 h-24 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Sk className="h-7 w-48" />
            <Sk className="h-4 w-64" />
            <Sk className="h-4 w-32" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Sk key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchCandidate} />;
  if (!candidate)
    return <ErrorState message="This candidate profile could not be found." />;

  const { jobseeker } = candidate;
  const locationStr =
    typeof jobseeker?.location === "object"
      ? [jobseeker.location.city, jobseeker.location.country]
          .filter(Boolean)
          .join(", ")
      : jobseeker?.location || "";

  const isEmployer = user?.role === "employer";
  const alreadyHired = candidate.status === "accepted";

  const STATUS_COLORS = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    reviewed: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-lime-50 text-lime-700 border-lime-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={15} /> Back to candidates
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── MAIN ────────────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Profile header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {jobseeker?.avatar ? (
                <img
                  src={jobseeker.avatar}
                  alt={jobseeker.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                  {(jobseeker?.fullName || "U").charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-3 mb-2">
                  <h1 className="text-2xl font-black text-gray-900">
                    {jobseeker?.fullName}
                  </h1>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[candidate.status] || STATUS_COLORS.pending}`}
                  >
                    {candidate.status}
                  </span>
                </div>
                {jobseeker?.headline && (
                  <p className="text-gray-700 font-medium mb-0.5">
                    {jobseeker.headline}
                  </p>
                )}
                {jobseeker?.tagline && (
                  <p className="text-sm text-gray-500 italic mb-3">
                    {jobseeker.tagline}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                  {jobseeker?.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={11} />
                      {jobseeker.email}
                    </span>
                  )}
                  {locationStr && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {locationStr}
                    </span>
                  )}
                  {jobseeker?.linkedin && (
                    <a
                      href={jobseeker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Linkedin size={11} />
                      LinkedIn
                    </a>
                  )}
                  {jobseeker?.github && (
                    <a
                      href={jobseeker.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-700 hover:underline"
                    >
                      <Github size={11} />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Employer action bar */}
            {!user ? (
              <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Lock size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-500 flex-1">
                    <button
                      onClick={() =>
                        router.push(
                          `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
                        )
                      }
                      className="font-semibold text-primary-600 hover:underline"
                    >
                      Log in as an employer
                    </button>{" "}
                    to hire or schedule an interview
                  </p>
                </div>
              </div>
            ) : isEmployer ? (
              <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowInterview(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
                >
                  <Calendar size={15} /> Schedule Interview
                </button>
                <button
                  onClick={handleHire}
                  disabled={hiringId || alreadyHired}
                  className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl text-sm transition ${
                    alreadyHired
                      ? "bg-lime-100 text-lime-700 cursor-default"
                      : "bg-lime-600 hover:bg-lime-700 text-white disabled:opacity-60"
                  }`}
                >
                  {hiringId ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <UserCheck size={15} />
                  )}
                  {alreadyHired ? "Hired ✓" : "Hire Candidate"}
                </button>
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  <MessageSquare size={15} /> Message
                </button>
              </div>
            ) : null}
          </div>

          {/* Applied role */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
              <Briefcase size={14} className="text-lime-600" /> Applied Role
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                ["Role", candidate.roleTitle],
                ["Type", candidate.roleType],
                ["Location", candidate.preferredLocation],
                [
                  "Applied",
                  new Date(candidate.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                ],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {val || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cover letter */}
          {candidate.coverLetter && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                Cover Letter
              </h2>
              <blockquote className="border-l-4 border-lime-500 pl-4 text-sm text-gray-600 leading-relaxed italic whitespace-pre-line">
                {candidate.coverLetter}
              </blockquote>
            </div>
          )}

          {/* Skills */}
          {jobseeker?.skill?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <Code2 size={14} className="text-lime-600" /> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {jobseeker.skill.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full border border-lime-100"
                  >
                    {s.name || s}
                    {s.level ? ` · ${s.level}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work experience */}
          {jobseeker?.workExperience?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <Briefcase size={14} className="text-lime-600" /> Work
                Experience
              </h2>
              <div className="space-y-4">
                {jobseeker.workExperience.map((w, i) => (
                  <div
                    key={i}
                    className={
                      i < jobseeker.workExperience.length - 1
                        ? "pb-4 border-b border-gray-100"
                        : ""
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {w.jobTitle || w.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {w.company}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {w.startDate?.slice?.(0, 7) || ""} —{" "}
                          {w.endDate ? w.endDate.slice(0, 7) : "Present"}
                        </p>
                      </div>
                    </div>
                    {w.description && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {w.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {jobseeker?.education?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <GraduationCap size={14} className="text-lime-600" /> Education
              </h2>
              <div className="space-y-3">
                {jobseeker.education.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4"
                  >
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
          {jobseeker?.certifications?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
                <Award size={14} className="text-lime-600" /> Certifications
              </h2>
              <div className="space-y-2">
                {jobseeker.certifications.map((c, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {c.title}
                      </p>
                      {c.organization && (
                        <p className="text-xs text-gray-500">
                          {c.organization}
                        </p>
                      )}
                    </div>
                    {c.dateEarned && (
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(c.dateEarned).getFullYear()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {jobseeker?.projects?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
                <Globe size={14} className="text-lime-600" /> Projects
              </h2>
              <div className="space-y-3">
                {jobseeker.projects.map((p, i) => (
                  <div key={i}>
                    {p.link ? (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm text-lime-700 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
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
            </div>
          )}
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
          {/* Other applications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              Other applications by {jobseeker?.fullName?.split(" ")[0]}
            </h3>
            {relatedApplications.length ? (
              <div className="space-y-3">
                {relatedApplications.map((app) => (
                  <Link
                    key={app._id}
                    href={`/find-candidates/${app._id}`}
                    className="block p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                  >
                    <p className="font-semibold text-sm text-gray-900">
                      {app.roleTitle}
                    </p>
                    <p className="text-xs text-gray-400">{app.roleType}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No other applications.</p>
            )}
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Resume</h3>
            <p className="text-xs text-gray-500">
              {candidate.resumeAvailable
                ? "Resume available — contact the candidate directly to request it."
                : "No resume uploaded."}
            </p>
          </div>
        </aside>
      </div>

      {/* Interview modal */}
      {showInterview && (
        <InterviewModal
          applicationId={id}
          candidateName={jobseeker?.fullName}
          onClose={() => setShowInterview(false)}
          onSuccess={() => {
            setShowInterview(false);
            notify(
              "Interview scheduled! The candidate will see it on their dashboard.",
            );
          }}
        />
      )}
    </main>
  );
}
