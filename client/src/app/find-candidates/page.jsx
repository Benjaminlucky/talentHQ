"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Users,
  Briefcase,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

const ROLE_TYPES = [
  "Full-time",
  "full-time role",
  "Part-time",
  "Contract",
  "Internship",
];
const PER_PAGE = 12;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCandidateCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-100 rounded mb-1.5" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
function CandidateCard({ app }) {
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
      : app.jobseeker?.location || app.preferredLocation || "";

  // Status badge colour
  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700",
    reviewed: "bg-blue-50 text-blue-700",
    accepted: "bg-lime-50 text-lime-700",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <Link
      href={`/find-candidates/${app._id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-md p-6 transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start gap-4 mb-4">
        {app.jobseeker?.avatar ? (
          <img
            src={app.jobseeker.avatar}
            alt={name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-lime-700 transition-colors">
            {name}
          </h3>
          {app.jobseeker?.headline && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {app.jobseeker.headline}
            </p>
          )}
          <p className="text-sm font-semibold text-lime-700 mt-1 truncate">
            {app.roleTitle}
          </p>
        </div>

        {app.status && (
          <span
            className={`flex-shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${statusColors[app.status] || "bg-gray-100 text-gray-600"}`}
          >
            {app.status}
          </span>
        )}
      </div>

      {app.coverLetter && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {app.coverLetter}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-auto">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-gray-400" />
            {location}
          </span>
        )}
        {app.roleType && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full">
            <Briefcase size={10} className="text-gray-400" />
            {app.roleType}
          </span>
        )}
        {app.jobseeker?.skill?.length > 0 && (
          <span className="ml-auto text-gray-400">
            {app.jobseeker.skill.length} skills
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function FindCandidatesPage() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [roleType, setRoleType] = useState("");
  const [committed, setCommitted] = useState({
    search: "",
    location: "",
    roleType: "",
  });
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const base = process.env.NEXT_PUBLIC_API_BASE;

  const fetchCandidates = useCallback(
    async (page, filters, append = false) => {
      if (page === 1 && !append) setLoading(true);
      else setLoadingMore(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: PER_PAGE,
          ...(filters.search && { search: filters.search }),
          ...(filters.location && { location: filters.location }),
          ...(filters.roleType && { roleType: filters.roleType }),
        });
        const res = await fetch(`${base}/api/profile/applications?${params}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = data.applications || (Array.isArray(data) ? data : []);
        setApplications((prev) => (append ? [...prev, ...list] : list));
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || list.length);
      } catch {
        if (!append) setApplications([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [base],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchCandidates(1, committed, false);
  }, [committed, fetchCandidates]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCommitted({ search, location: locationFilter, roleType });
  };

  const clearFilter = (key) => {
    const updates = { ...committed, [key]: "" };
    setCommitted(updates);
    if (key === "search") setSearch("");
    if (key === "location") setLocationFilter("");
    if (key === "roleType") setRoleType("");
  };

  const activeFilters = Object.entries(committed).filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
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
                placeholder="Search by name, role, or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50"
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
                className="w-full sm:w-40 pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50"
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
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl hover:bg-primary-600 transition-colors"
            >
              Search
            </button>
          </form>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">All Role Types</option>
                {ROLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map(([key, val]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lime-50 text-lime-700 text-xs font-medium rounded-full"
                >
                  {val}
                  <button onClick={() => clearFilter(key)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!loading && (
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                {total || applications.length}
              </span>{" "}
              candidates found
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCandidateCard key={i} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">
              No candidates found
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Try broadening your search or come back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <CandidateCard key={app._id} app={app} />
            ))}
          </div>
        )}

        {!loading && currentPage < totalPages && (
          <div className="mt-10 text-center">
            <button
              onClick={() => {
                const next = currentPage + 1;
                setCurrentPage(next);
                fetchCandidates(next, committed, true);
              }}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:border-lime-300 hover:text-lime-700 transition-all disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronRight size={16} />
              )}
              {loadingMore ? "Loading..." : "Load more candidates"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
