"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  Wrench,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Clock,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const TRADES = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Welder",
  "Bricklayer / Mason",
  "Tiler",
  "Roofer",
  "HVAC Technician",
  "Generator Technician",
  "Auto Mechanic",
  "Vulcanizer",
  "Tailor / Seamstress",
  "Barber / Hairstylist",
  "Graphic Designer",
  "Web Designer",
  "Photographer",
  "Videographer",
  "Caterer / Chef",
  "Cleaner",
  "Security Guard",
  "Driver",
  "Laundry / Dry Cleaner",
  "AC Technician",
  "Solar Installer",
  "CCTV Installer",
  "Interior Decorator",
  "Fumigator / Pest Control",
  "Glazier",
  "Other",
];

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="h-9 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ── Handyman card ──────────────────────────────────────────────────────────────
function HandymanCard({ handyman }) {
  const initials = (handyman.fullName || "H")
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
      className="bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-md p-5 transition-all group"
    >
      <div className="flex items-start gap-4 mb-4">
        {handyman.avatar ? (
          <img
            src={handyman.avatar}
            alt={handyman.fullName}
            className="w-14 h-14 rounded-full object-cover border border-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors truncate">
            {handyman.fullName}
          </h3>
          {handyman.trade && (
            <p className="text-xs text-amber-600 font-semibold mt-0.5">
              {handyman.trade}
            </p>
          )}
          {handyman.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={9} />
              {handyman.location}
            </p>
          )}
          {handyman.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">
                {handyman.avgRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">
                ({handyman.reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {handyman.yearsExperience > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100 font-medium">
            <Clock size={9} />
            {handyman.yearsExperience}yr{handyman.yearsExperience !== 1 ? "s" : ""} exp
          </span>
        )}
        {handyman.skills?.slice(0, 2).map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full font-medium truncate max-w-[90px]"
          >
            {skill}
          </span>
        ))}
      </div>

      {handyman.bio && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{handyman.bio}</p>
      )}

      <Link
        href={`/handymen/${handyman._id}`}
        className="flex items-center justify-center gap-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition"
      >
        View Profile <ChevronRight size={12} />
      </Link>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function HandymenPage() {
  const [handymen, setHandymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [trade, setTrade] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchHandymen = useCallback(
    async (p = 1, append = false) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const params = { page: p, limit: 12 };
        if (search) params.search = search;
        if (trade) params.trade = trade;
        if (location) params.location = location;

        const res = await axios.get(`${API}/api/handymen`, { params });
        const list = res.data.handymen || [];

        setHandymen((prev) => (append ? [...prev, ...list] : list));
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || list.length);
      } catch {
        // silently fail — shows empty state
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, trade, location],
  );

  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => fetchHandymen(1, false), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchHandymen]);

  const activeFilters = [
    trade && { label: trade, clear: () => setTrade("") },
    location && { label: location, clear: () => setLocation("") },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Find Skilled Handymen
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Connect with verified tradespeople and skilled professionals across
            Nigeria
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
                placeholder="Search by name, trade or skill…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 focus:bg-white transition"
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
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
          </div>

          {showFilters && (
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full sm:w-56 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 cursor-pointer"
              >
                <option value="">All Trades</option>
                {TRADES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <div className="relative flex-1 sm:max-w-xs">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Filter by location…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 focus:bg-white transition"
                />
                {location && (
                  <button
                    onClick={() => setLocation("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"
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
            {total} handyman{total !== 1 ? "s" : ""} found
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
        ) : handymen.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Wrench size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">No handymen found</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {search || trade || location
                ? "Try adjusting your filters."
                : "No handymen registered yet."}
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {handymen.map((h) => (
                  <HandymanCard key={h._id} handyman={h} />
                ))}
              </div>
            </AnimatePresence>

            {page < totalPages && (
              <div className="text-center mt-10">
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchHandymen(next, true);
                  }}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:border-amber-300 hover:text-amber-700 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                  {loadingMore ? "Loading…" : "Load more handymen"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
