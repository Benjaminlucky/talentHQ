"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Users,
  Briefcase,
  Star,
  Building2,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Globe,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Legal",
  "Education",
  "Marketing",
  "Engineering",
  "Agriculture",
  "Operations",
  "Sales",
  "Logistics",
  "Media",
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-7 flex-1 bg-gray-100 rounded-xl" />
        <div className="h-7 w-20 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ── Company card ──────────────────────────────────────────────────────────────
function CompanyCard({ employer, jobCount }) {
  const initials = (employer.companyName || employer.fullName || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md p-5 transition-all group"
    >
      <div className="flex items-start gap-4 mb-4">
        {employer.logo ? (
          <img
            src={employer.logo}
            alt={employer.companyName}
            className="w-14 h-14 rounded-xl object-contain border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">
            {employer.companyName || employer.fullName}
          </h3>
          {employer.industry && (
            <p className="text-xs text-gray-500 mt-0.5">{employer.industry}</p>
          )}
          {employer.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={9} />
              {employer.location}
            </p>
          )}
          {employer.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">
                {employer.avgRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">
                ({employer.reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {employer.companySize && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100 font-medium">
            <Users size={9} />
            {employer.companySize}
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border font-bold ${
            jobCount > 0
              ? "bg-lime-50 text-lime-700 border-lime-200"
              : "bg-gray-50 text-gray-400 border-gray-100"
          }`}
        >
          <Briefcase size={9} />
          {jobCount} open {jobCount === 1 ? "job" : "jobs"}
        </span>
      </div>

      <Link
        href={`/employers/${employer._id}`}
        className="flex items-center justify-center gap-2 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition"
      >
        View Company <ChevronRight size={12} />
      </Link>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CompaniesPage() {
  const [employers, setEmployers] = useState([]);
  const [jobCounts, setJobCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchEmployers = useCallback(
    async (p = 1, append = false) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        // Use the jobs endpoint employer profile which returns employer + job counts
        // Fall back to employer listing from /api/employers route
        const params = { page: p, limit: 12 };
        if (search) params.search = search;
        if (industry) params.industry = industry;

        const res = await axios.get(`${API}/api/employers/browse`, { params });
        const list = res.data.employers || res.data || [];

        setEmployers((prev) => (append ? [...prev, ...list] : list));
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || list.length);

        // Build job count map
        const counts = {};
        (res.data.jobCounts || []).forEach(({ _id, count }) => {
          counts[_id] = count;
        });
        setJobCounts((prev) => (append ? { ...prev, ...counts } : counts));
      } catch {
        // Silently fail — page shows empty state
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, industry],
  );

  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => fetchEmployers(1, false), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchEmployers]);

  const activeFilters = [
    industry && { label: industry, clear: () => setIndustry("") },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Browse Companies
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Discover top employers across Nigeria hiring talented professionals
            and skilled trades
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company name…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
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
              Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
          </div>

          {showFilters && (
            <div className="pt-3 border-t border-gray-100">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full sm:w-56 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 cursor-pointer"
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full"
                >
                  {f.label}
                  <button onClick={f.clear}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            {total} compan{total !== 1 ? "ies" : "y"} found
            {search && (
              <>
                {" "}
                matching <strong>"{search}"</strong>
              </>
            )}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : employers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Building2 size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">No companies found</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {search || industry
                ? "Try adjusting your filters."
                : "No employers registered yet."}
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {employers.map((emp) => (
                  <CompanyCard
                    key={emp._id}
                    employer={emp}
                    jobCount={jobCounts[emp._id] || 0}
                  />
                ))}
              </div>
            </AnimatePresence>

            {page < totalPages && (
              <div className="text-center mt-10">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchEmployers(next, true);
                  }}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:border-primary-300 hover:text-primary-700 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                  {loadingMore ? "Loading…" : "Load more companies"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
