"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Phone,
  Filter,
  X,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Building2,
  Calendar,
  Tag,
  SlidersHorizontal,
  Send,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Constants ─────────────────────────────────────────────────────────────────
const TRADES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Tiling",
  "Welding",
  "Masonry",
  "AC Repair",
  "Generator Repair",
  "Other",
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonJobCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-gray-100 rounded-xl" />
        <div className="h-8 flex-1 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ── Apply Modal ───────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
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
      setError("Please write at least 20 characters in your message");
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
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="font-black text-gray-900 text-base">
              Apply for this job
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {job.title} · {job.location}
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
              Your Trade / Skill
            </label>
            <input
              value={form.roleTitle}
              onChange={(e) =>
                setForm((p) => ({ ...p, roleTitle: e.target.value }))
              }
              placeholder="e.g. Plumber, Electrician"
              className={INP}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Cover Message *
            </label>
            <textarea
              rows={5}
              value={form.coverLetter}
              onChange={(e) =>
                setForm((p) => ({ ...p, coverLetter: e.target.value }))
              }
              placeholder={`Hi, I'm a skilled ${user?.trade || "tradesperson"} with ${user?.yearsExperience || "several"} years of experience. I'm interested in this job because...`}
              className={`${INP} resize-none`}
              maxLength={1500}
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {form.coverLetter.length}/1500
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Portfolio / Previous Work (optional)
            </label>
            <input
              value={form.portfolioLinks}
              onChange={(e) =>
                setForm((p) => ({ ...p, portfolioLinks: e.target.value }))
              }
              placeholder="Links to photos or previous work (comma separated)"
              className={INP}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send size={15} /> Submit Application
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
function JobCard({ job, onApply }) {
  const companyName = job.company?.companyName || "Company";
  const initials = companyName.slice(0, 2).toUpperCase();
  const daysAgo = job.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(job.createdAt)) / 86400000))
    : null;

  const deadline = job.deadline ? new Date(job.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000))
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-md p-5 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={companyName}
              className="w-11 h-11 rounded-xl object-contain border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-amber-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
              <Building2 size={10} />
              {companyName}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {job.type}
        </span>
      </div>

      {job.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {job.description}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} className="text-gray-400" />
            {job.location}
            {job.state ? `, ${job.state}` : ""}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-amber-700 font-semibold">
            <DollarSign size={10} />₦{job.salary}
          </span>
        )}
        {job.experienceLevel && (
          <span className="flex items-center gap-1">
            <Briefcase size={10} className="text-gray-400" />
            {job.experienceLevel}
          </span>
        )}
        {daysLeft !== null && daysLeft < 14 && (
          <span
            className={`flex items-center gap-1 font-semibold ${daysLeft < 3 ? "text-red-500" : "text-amber-600"}`}
          >
            <Calendar size={10} />
            {daysLeft}d left
          </span>
        )}
        {daysAgo !== null && (
          <span className="flex items-center gap-1 ml-auto text-gray-400">
            <Clock size={10} />
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </span>
        )}
      </div>

      {job.skills && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills
            .split(",")
            .slice(0, 4)
            .map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-100"
              >
                {s.trim()}
              </span>
            ))}
        </div>
      )}

      <div className="flex gap-2">
        {job.phoneNumber && (
          <a
            href={`tel:${job.phoneNumber}`}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            <Phone size={12} /> Call
          </a>
        )}
        <button
          onClick={() => onApply(job)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors"
        >
          <Send size={12} /> Apply Now
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HandymanJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(
    async (page = 1, append = false) => {
      if (page === 1 && !append) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await axios.get(`${API}/api/jobs`, {
          params: {
            jobFor: "handyman",
            search,
            location,
            category,
            jobType,
            page,
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
    setCurrentPage(1);
    const t = setTimeout(() => fetchJobs(1, false), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const handleLoadMore = () => {
    const next = currentPage + 1;
    setCurrentPage(next);
    fetchJobs(next, true);
  };

  const activeFilters = [
    location && {
      key: "location",
      val: location,
      clear: () => setLocation(""),
    },
    category && {
      key: "category",
      val: category,
      clear: () => setCategory(""),
    },
    jobType && { key: "jobType", val: jobType, clear: () => setJobType("") },
  ].filter(Boolean);

  return (
    <ProtectedRoute allowedRoles={["handyman"]}>
      <div className="space-y-6 max-w-5xl">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
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
        <div className="bg-amber-500 rounded-2xl px-6 py-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Wrench size={22} />
            <h1 className="text-2xl font-black">Handyman Jobs</h1>
          </div>
          <p className="text-amber-100 text-sm">
            Browse {total > 0 ? `${total} ` : ""}trade and skilled jobs posted
            by employers near you
          </p>
        </div>

        {/* Search + filters */}
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
                placeholder="Search by job title or trade…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-xl transition ${
                showFilters || activeFilters.length > 0
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 bg-white text-amber-600 rounded-full text-[10px] font-black flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location / City"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 cursor-pointer"
              >
                <option value="">All Trades</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"
                >
                  {f.val}
                  <button onClick={f.clear}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {!loading && (
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{total}</span> handyman{" "}
            {total === 1 ? "job" : "jobs"} found
            {search && (
              <>
                {" "}
                matching "<span className="font-semibold">{search}</span>"
              </>
            )}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonJobCard key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <Wrench size={28} className="text-amber-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">
              No handyman jobs found
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {activeFilters.length > 0 || search
                ? "Try broadening your search or clearing filters."
                : "Employers haven't posted handyman jobs yet. Check back soon."}
            </p>
            {(activeFilters.length > 0 || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  setLocation("");
                  setCategory("");
                  setJobType("");
                }}
                className="mt-4 px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onApply={setApplyTarget} />
                ))}
              </AnimatePresence>
            </div>

            {currentPage < totalPages && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:border-amber-300 hover:text-amber-700 transition disabled:opacity-50"
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
                setApplyTarget(null);
                notify(
                  "Application submitted! You can track it in your applications.",
                );
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
