"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Search,
  MapPin,
  Filter,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  X,
  Loader2,
  SlidersHorizontal,
  Building2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
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
  "Other",
];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const JOBS_PER_PAGE = 12;

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonJobCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div>
            <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job }) {
  const companyName =
    job.company?.companyName || job.company?.fullName || "Company";
  const initials = companyName.slice(0, 2).toUpperCase();
  const daysAgo = job.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(job.createdAt)) / 86400000))
    : null;

  return (
    <Link
      href={`/findjob/${job._id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-md p-6 transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={companyName}
              className="w-12 h-12 rounded-xl object-contain border border-gray-100 flex-shrink-0 bg-gray-50 p-1"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-lime-700 transition-colors leading-tight">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
              <Building2 size={11} />
              {companyName}
            </p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ml-2 ${
            job.type === "Full-time"
              ? "bg-lime-50 text-lime-700"
              : job.type === "Contract"
                ? "bg-blue-50 text-blue-700"
                : "bg-orange-50 text-orange-700"
          }`}
        >
          {job.type}
        </span>
      </div>

      {job.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {job.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-auto">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-gray-400" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-lime-700 font-medium">
            <DollarSign size={11} />
            {job.salary}
          </span>
        )}
        {daysAgo !== null && (
          <span className="flex items-center gap-1 ml-auto text-gray-400">
            <Clock size={11} />
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </span>
        )}
      </div>

      {/* Skills tags */}
      {job.skills && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
          {job.skills
            .split(",")
            .slice(0, 3)
            .map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md"
              >
                {s.trim()}
              </span>
            ))}
        </div>
      )}
    </Link>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function FindJobsClient() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || "",
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "");
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Committed (submitted) filter values
  const [committed, setCommitted] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
    jobType: searchParams.get("jobType") || "",
  });

  const fetchJobs = useCallback(async (page, filters, append = false) => {
    if (page === 1 && !append) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs`,
        {
          params: { ...filters, page, limit: JOBS_PER_PAGE },
        },
      );
      const newJobs = res.data.jobs || [];
      setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
      setTotalPages(res.data.totalPages || 1);
      setTotalJobs(res.data.total || newJobs.length);
    } catch {
      if (!append) setJobs([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load + filter change
  useEffect(() => {
    setCurrentPage(1);
    fetchJobs(1, committed, false);
  }, [committed, fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCommitted({ search, location: locationFilter, category, jobType });
  };

  const handleLoadMore = () => {
    const next = currentPage + 1;
    setCurrentPage(next);
    fetchJobs(next, committed, true);
  };

  const clearFilter = (key) => {
    const updates = { ...committed, [key]: "" };
    setCommitted(updates);
    if (key === "search") setSearch("");
    if (key === "location") setLocationFilter("");
    if (key === "category") setCategory("");
    if (key === "jobType") setJobType("");
  };

  const activeFilters = Object.entries(committed).filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search job title, skills, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50"
              />
            </div>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full sm:w-40 pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-xl transition-colors ${
                showFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 bg-lime-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {activeFilters.length}
                </span>
              )}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl hover:bg-primary-600 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filter row */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">All Types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map(([key, val]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lime-50 text-lime-700 text-xs font-medium rounded-full"
                >
                  {val}
                  <button onClick={() => clearFilter(key)}>
                    <X size={12} className="hover:text-lime-900" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  setSearch("");
                  setLocationFilter("");
                  setCategory("");
                  setJobType("");
                  setCommitted({
                    search: "",
                    location: "",
                    category: "",
                    jobType: "",
                  });
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Result count */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {totalJobs > 0 ? (
                <>
                  <span className="font-semibold text-gray-900">
                    {totalJobs}
                  </span>{" "}
                  jobs found
                </>
              ) : (
                "No jobs match your search"
              )}
            </p>
            <p className="text-xs text-gray-400">
              Showing {jobs.length} of {totalJobs}
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonJobCard key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">No jobs found</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Try adjusting your search or filters. New jobs are posted daily.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setLocationFilter("");
                setCategory("");
                setJobType("");
                setCommitted({
                  search: "",
                  location: "",
                  category: "",
                  jobType: "",
                });
              }}
              className="px-5 py-2.5 bg-primary-500 text-white font-semibold rounded-xl text-sm hover:bg-primary-600 transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && currentPage < totalPages && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:border-lime-300 hover:text-lime-700 transition-all disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronRight size={16} />
              )}
              {loadingMore ? "Loading..." : "Load more jobs"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
