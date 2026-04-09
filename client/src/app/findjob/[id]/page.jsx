"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Tag,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Building2,
  Phone,
  Send,
  X,
  Loader2,
  AlertCircle,
  Lock,
  Globe,
  ExternalLink,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

// ── Auth gate ─────────────────────────────────────────────────────────────────
function AuthGate({ message, redirectTo }) {
  const router = useRouter();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={36} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          Sign in to apply
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() =>
              router.push(
                `/login?redirect=${encodeURIComponent(redirectTo || window.location.pathname)}`,
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
        <h3 className="font-bold text-gray-900 mb-2">Couldn't load this job</h3>
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
            href="/findjob"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Apply modal ───────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const ROLE_TYPES = [
    "full-time role",
    "part-time role",
    "contract",
    "internship",
    "remote",
  ];
  const [form, setForm] = useState({
    roleTitle: job.title,
    roleType:
      job.type === "Full-time"
        ? "full-time role"
        : job.type === "Part-time"
          ? "part-time role"
          : "contract",
    preferredLocation: job.location || "",
    coverLetter: "",
    portfolioLinks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const INP =
    "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coverLetter.trim() || form.coverLetter.trim().length < 20) {
      setError("Please write a cover letter (at least 20 characters)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/api/profile/me/applications`, form, {
        withCredentials: true,
      });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Apply for this role</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {job.title} · {job.company?.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 flex-shrink-0"
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
              Role
            </label>
            <input
              value={form.roleTitle}
              onChange={(e) =>
                setForm((p) => ({ ...p, roleTitle: e.target.value }))
              }
              className={INP}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Type
            </label>
            <select
              value={form.roleType}
              onChange={(e) =>
                setForm((p) => ({ ...p, roleType: e.target.value }))
              }
              className={`${INP} cursor-pointer appearance-none`}
            >
              {ROLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Cover Letter *
            </label>
            <textarea
              rows={5}
              value={form.coverLetter}
              onChange={(e) =>
                setForm((p) => ({ ...p, coverLetter: e.target.value }))
              }
              placeholder="Why are you a great fit for this role?"
              className={`${INP} resize-none`}
              maxLength={2000}
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {form.coverLetter.length}/2000
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Portfolio Links (optional)
            </label>
            <input
              value={form.portfolioLinks}
              onChange={(e) =>
                setForm((p) => ({ ...p, portfolioLinks: e.target.value }))
              }
              placeholder="https://github.com/you, https://portfolio.com"
              className={INP}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Submit Application
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/jobs/${id}`);
      setJob(res.data);
      if (res.data?.company?._id) {
        const rel = await axios.get(`${API}/api/jobs`, {
          params: { company: res.data.company._id, limit: 5 },
        });
        setRelatedJobs((rel.data.jobs || []).filter((j) => j._id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const handleApplyClick = () => {
    if (authLoading) return;
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    if (user.role === "employer") {
      notify("Employers cannot apply for jobs", "error");
      return;
    }
    setShowApply(true);
  };

  if (authLoading || loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <Sk className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Sk className="h-40" />
          <Sk className="h-40" />
        </div>
        <Sk className="h-32 w-full" />
      </main>
    );
  }

  if (showAuthGate) {
    return (
      <AuthGate
        message="You need to be logged in as a jobseeker or handyman to apply for jobs. Create a free account in under 2 minutes."
        redirectTo={`/findjob/${id}`}
      />
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchJob} />;
  if (!job)
    return (
      <ErrorState message="This job listing could not be found. It may have been removed." />
    );

  const responsibilities =
    job.responsibilities
      ?.split(",")
      .map((r) => r.trim())
      .filter(Boolean) || [];
  const skills =
    job.skills
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) || [];
  const benefits =
    job.benefits
      ?.split(",")
      .map((b) => b.trim())
      .filter(Boolean) || [];
  const daysLeft = job.deadline
    ? Math.max(0, Math.ceil((new Date(job.deadline) - Date.now()) / 86400000))
    : null;
  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-lime-600 text-white"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          {toast.msg}
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={15} /> Back to jobs
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── MAIN ──────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.companyName}
                  className="w-16 h-16 rounded-xl object-contain border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {(job.company?.companyName || "C").charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-black text-gray-900 mb-1">
                  {job.title}
                </h1>
                <p className="text-gray-600 font-semibold mb-2">
                  {job.company?.companyName}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-gray-400" />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={13} className="text-gray-400" />
                      {job.type}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1 text-lime-700 font-semibold">
                      <DollarSign size={13} />₦{job.salary}
                    </span>
                  )}
                  {job.category && (
                    <span className="flex items-center gap-1">
                      <Tag size={13} className="text-gray-400" />
                      {job.category}
                    </span>
                  )}
                </div>
                {daysLeft !== null && (
                  <p
                    className={`mt-2 text-xs font-semibold ${isExpired ? "text-red-500" : daysLeft < 7 ? "text-amber-600" : "text-gray-400"}`}
                  >
                    <Calendar size={11} className="inline mr-1" />
                    {isExpired
                      ? "Application deadline passed"
                      : `${daysLeft} days left to apply`}
                  </p>
                )}
              </div>
            </div>

            {/* Apply button */}
            {applied ? (
              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3 px-4 py-3 bg-lime-50 rounded-xl">
                <CheckCircle2
                  size={18}
                  className="text-lime-600 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-lime-700">
                    Application submitted!
                  </p>
                  <Link
                    href="/dashboard/jobseeker/applications"
                    className="text-xs text-lime-600 hover:underline"
                  >
                    Track in your dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
                <button
                  onClick={handleApplyClick}
                  disabled={isExpired}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition"
                >
                  <Send size={15} />
                  {isExpired ? "Deadline passed" : "Apply Now"}
                </button>
                {!user && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 self-center">
                    <Lock size={11} />
                    <button
                      onClick={() => setShowAuthGate(true)}
                      className="underline hover:text-gray-800"
                    >
                      Log in
                    </button>{" "}
                    to apply
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">About this role</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Responsibilities + Qualification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">
                Responsibilities
              </h3>
              {responsibilities.length ? (
                <ul className="space-y-2">
                  {responsibilities.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-lime-600 flex-shrink-0 mt-0.5"
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">Not listed</p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">
                Qualification
              </h3>
              <p className="text-sm text-gray-600 italic leading-relaxed">
                {job.qualification || "Not specified"}
              </p>
            </div>
          </div>

          {/* Skills + Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.length ? (
                  skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full border border-lime-100"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Not listed</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {benefits.length ? (
                  benefits.map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100"
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Not listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">
              Job Details
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ["Experience", job.experienceLevel],
                ["Category", job.category],
                [
                  "For",
                  job.jobFor === "handyman"
                    ? "Handyman / Trade"
                    : "Professional",
                ],
                ["State", job.state],
                ["LGA", job.lga],
                [
                  "Deadline",
                  job.deadline
                    ? new Date(job.deadline).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : null,
                ],
              ]
                .filter(([, v]) => v)
                .map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {label}
                    </dt>
                    <dd className="font-semibold text-gray-800 mt-0.5">
                      {val}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* Contact */}
          {(job.phoneNumber || job.address) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {job.phoneNumber && (
                  <p className="flex items-center gap-2">
                    <Phone size={13} className="text-gray-400" />
                    {job.phoneNumber}
                  </p>
                )}
                {job.address && (
                  <p className="flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400" />
                    {job.address}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
          {/* Sticky apply */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt=""
                  className="w-10 h-10 rounded-xl object-contain border border-gray-100 p-0.5 bg-gray-50"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                  {(job.company?.companyName || "C").charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {job.company?.companyName}
                </p>
                {job.company?.industry && (
                  <p className="text-xs text-gray-400">
                    {job.company.industry}
                  </p>
                )}
              </div>
            </div>
            {!applied && !isExpired && (
              <button
                onClick={handleApplyClick}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition"
              >
                <Send size={14} /> Apply Now
              </button>
            )}
          </div>

          {/* Related jobs */}
          {relatedJobs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                More from {job.company?.companyName}
              </h3>
              <div className="space-y-3">
                {relatedJobs.map((rj) => (
                  <Link
                    key={rj._id}
                    href={`/findjob/${rj._id}`}
                    className="block p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                  >
                    <p className="font-semibold text-sm text-gray-900">
                      {rj.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {rj.type} · {rj.location}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Apply modal */}
      {showApply && (
        <ApplyModal
          job={job}
          onClose={() => setShowApply(false)}
          onSuccess={() => {
            setShowApply(false);
            setApplied(true);
            notify("Application submitted successfully!");
          }}
        />
      )}

      {/* Mobile sticky apply */}
      {!applied && !isExpired && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 lg:hidden shadow-lg z-40">
          <button
            onClick={handleApplyClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition"
          >
            <Send size={15} /> Apply Now
          </button>
        </div>
      )}
    </main>
  );
}
