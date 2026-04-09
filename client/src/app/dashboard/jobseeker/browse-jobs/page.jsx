"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Tag,
  Clock,
  Building2,
  ChevronRight,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const CATEGORIES = [
  "Technology",
  "Finance",
  "Marketing",
  "Design",
  "Sales",
  "Healthcare",
  "Engineering",
  "Education",
  "Administration",
  "Accounting",
  "Legal",
  "Operations",
  "Human Resources",
];

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Sk className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Sk className="h-4 w-40" />
          <Sk className="h-3 w-28" />
        </div>
      </div>
      <Sk className="h-3 w-full mb-1.5" />
      <Sk className="h-3 w-2/3 mb-4" />
      <div className="flex gap-2">
        <Sk className="h-8 w-20 rounded-xl" />
        <Sk className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// ── Apply modal ───────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
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

  const submit = async (e) => {
    e.preventDefault();
    if (!form.coverLetter.trim() || form.coverLetter.trim().length < 20) {
      setError("Please write a cover letter (min 20 characters)");
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
          "Failed to submit",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Apply for this job</h2>
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
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Role Title
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
              Cover Letter *
            </label>
            <textarea
              rows={5}
              value={form.coverLetter}
              onChange={(e) =>
                setForm((p) => ({ ...p, coverLetter: e.target.value }))
              }
              placeholder="Why are you the right person for this role?"
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
          <div className="flex gap-3 pt-1">
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
      </motion.div>
    </motion.div>
  );
}

// ── Job card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onApply, applied }) {
  const companyName = job.company?.companyName || "Company";
  const initials = companyName.slice(0, 2).toUpperCase();
  const deadline = job.deadline ? new Date(job.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000))
    : null;
  const isExpired = deadline && deadline < new Date();
  const daysAgo = Math.max(
    0,
    Math.floor((Date.now() - new Date(job.createdAt)) / 86400000),
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-sm p-5 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        {job.company?.logo ? (
          <img
            src={job.company.logo}
            alt={companyName}
            className="w-11 h-11 rounded-xl object-contain border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {job.title}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
              {job.type}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
            <Building2 size={10} />
            {companyName}
          </p>
        </div>
      </div>

      {job.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {job.description}
        </p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-lime-700 font-semibold">
            <DollarSign size={10} />₦{job.salary}
          </span>
        )}
        {job.experienceLevel && (
          <span className="flex items-center gap-1">
            <Briefcase size={10} />
            {job.experienceLevel}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap gap-1">
          {job.skills
            ?.split(",")
            .slice(0, 3)
            .map((s, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100"
              >
                {s.trim()}
              </span>
            ))}
        </div>
        {daysLeft !== null && (
          <p
            className={`text-[10px] font-semibold ${isExpired ? "text-red-500" : daysLeft < 5 ? "text-amber-600" : "text-gray-400"}`}
          >
            {isExpired ? "Expired" : `${daysLeft}d left`}
          </p>
        )}
      </div>

      {applied ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-lime-50 rounded-xl text-xs font-semibold text-lime-700">
          <CheckCircle2 size={13} /> Applied ✓
        </div>
      ) : (
        <button
          onClick={() => onApply(job)}
          disabled={isExpired}
          className="w-full flex items-center justify-center gap-2 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition"
        >
          <Send size={12} /> {isExpired ? "Deadline passed" : "Apply Now"}
        </button>
      )}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function JobseekerBrowseJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(
    async (p = 1, append = false) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await axios.get(`${API}/api/jobs`, {
          params: {
            search,
            location,
            category,
            jobType,
            jobFor: "professional",
            page: p,
            limit: 12,
          },
        });
        const newJobs = res.data.jobs || [];
        setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || res.data.totalJobs || newJobs.length);
      } catch {
        notify("Failed to load jobs", "error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, location, category, jobType],
  );

  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => fetchJobs(1, false), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const activeFilters = [
    location && { label: location, clear: () => setLocation("") },
    category && { label: category, clear: () => setCategory("") },
    jobType && { label: jobType, clear: () => setJobType("") },
  ].filter(Boolean);

  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      <div className="space-y-6 max-w-5xl">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">Browse Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} job{total !== 1 ? "s" : ""} available for you
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title, skills…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-xl transition ${
                showFilters || activeFilters.length
                  ? "bg-primary-500 text-white border-primary-500"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="relative">
                <MapPin
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 cursor-pointer"
              >
                <option value="">All Types</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {activeFilters.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full"
                >
                  {f.label}
                  <button onClick={f.clear}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Jobs grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Briefcase size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">No jobs found</h3>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onApply={setApplyTarget}
                    applied={appliedIds.has(job._id)}
                  />
                ))}
              </div>
            </AnimatePresence>
            {page < totalPages && (
              <div className="text-center">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchJobs(next, true);
                  }}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:border-primary-300 hover:text-primary-700 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                  {loadingMore ? "Loading…" : "Load more jobs"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Apply modal */}
        <AnimatePresence>
          {applyTarget && (
            <ApplyModal
              job={applyTarget}
              onClose={() => setApplyTarget(null)}
              onSuccess={() => {
                setAppliedIds((prev) => new Set([...prev, applyTarget._id]));
                setApplyTarget(null);
                notify("Application submitted! Track it in My Applications.");
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
