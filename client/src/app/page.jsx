"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  ChevronRight,
  Search,
  Users,
  Wrench,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const HERO_WORDS = ["Dream Job", "Top Talent", "Next Hire", "Best Match"];

const JOB_CATEGORIES = [
  "Technology",
  "Finance",
  "Marketing",
  "Design",
  "Sales",
  "Healthcare",
  "Engineering",
  "Education",
];

const STATS = [
  { value: "12,000+", label: "Active Jobs" },
  { value: "8,500+", label: "Candidates" },
  { value: "3,200+", label: "Companies" },
  { value: "95%", label: "Match Rate" },
];

const WHY_ITEMS = [
  {
    icon: Zap,
    title: "Fast Matching",
    desc: "AI-powered recommendations surface the right opportunities in seconds.",
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    desc: "Every employer and handyman is vetted before going live on the platform.",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    desc: "Track applications, update your profile, and build a reputation that gets you hired.",
    color: "text-lime-600 bg-lime-50",
  },
  {
    icon: Users,
    title: "All Workers Welcome",
    desc: "Whether you're a software engineer or a skilled plumber — TalentHQ is for you.",
    color: "text-purple-500 bg-purple-50",
  },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

// ─── Auto-scroll ticker ───────────────────────────────────────────────────────
function ScrollTicker({ children, speed = 35 }) {
  const trackRef = useRef(null);
  const controls = useAnimation();
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const start = () => {
      const dist = track.scrollWidth / 2;
      controls.start({
        x: [0, -dist],
        transition: {
          duration: dist / speed,
          ease: "linear",
          repeat: Infinity,
        },
      });
    };
    const t = setTimeout(start, 80);
    return () => clearTimeout(t);
  }, [children, controls, speed]);

  return (
    <div className="relative overflow-hidden w-full">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
      <motion.div
        ref={trackRef}
        className="flex gap-4 w-max"
        animate={controls}
        onMouseEnter={() => {
          pausedRef.current = true;
          controls.stop();
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
          const track = trackRef.current;
          if (!track) return;
          const dist = track.scrollWidth / 2;
          controls.start({
            x: [0, -dist],
            transition: {
              duration: dist / speed,
              ease: "linear",
              repeat: Infinity,
            },
          });
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ─── Job Card (ticker) ────────────────────────────────────────────────────────
function JobTickerCard({ job }) {
  return (
    <Link
      href={`/findjob/${job._id}`}
      className="flex-shrink-0 w-72 bg-white border border-gray-200 rounded-2xl p-5 hover:border-lime-300 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-lime-700 transition-colors">
            {job.title}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {job.company?.companyName || job.company?.fullName || "Company"}
          </p>
        </div>
        <div className="w-9 h-9 bg-lime-50 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
          <Briefcase size={15} className="text-lime-600" />
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {job.location?.split(",")[0] || "Nigeria"}
        </span>
        <span className="px-2 py-0.5 bg-gray-100 rounded-full">{job.type}</span>
        {job.salary && (
          <span className="text-lime-700 font-medium">{job.salary}</span>
        )}
      </div>
    </Link>
  );
}

// ─── Candidate Card (ticker) ──────────────────────────────────────────────────
function CandidateTickerCard({ app }) {
  const jsName = app.jobseeker?.fullName || "Candidate";
  const initials = jsName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Link
      href={`/find-candidates/${app._id}`}
      className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-2xl p-5 hover:border-lime-300 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 mb-3">
        {app.jobseeker?.avatar ? (
          <img
            src={app.jobseeker.avatar}
            alt={jsName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-lime-700 transition-colors">
            {jsName}
          </p>
          <p className="text-xs text-gray-500 truncate">{app.roleTitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-0.5 bg-lime-50 text-lime-700 rounded-full font-medium">
          {app.roleType}
        </span>
        {app.preferredLocation && (
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <MapPin size={10} />
            {app.preferredLocation}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Handyman Card (ticker) ───────────────────────────────────────────────────
function HandymanTickerCard({ h }) {
  const initials =
    h.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HM";
  return (
    <div className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-2xl p-5 hover:border-lime-300 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {h.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {h.trade || "Skilled Tradesperson"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium flex items-center gap-1">
          <Wrench size={10} />
          {h.trade || "Trade"}
        </span>
        {h.yearsExperience > 0 && (
          <span className="text-xs text-gray-400">
            {h.yearsExperience}y exp
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Hero word rotator ────────────────────────────────────────────────────────
function WordRotator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % HERO_WORDS.length),
      2800,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden h-[1.2em] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }}
          className="inline-block text-lime-600"
        >
          {HERO_WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [handymen, setHandymen] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingHandymen, setLoadingHandymen] = useState(true);
  const router_placeholder = null; // not needed here

  const base = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    axios
      .get(`${base}/api/jobs`, { params: { limit: 20 } })
      .then((r) => setJobs(r.data.jobs || []))
      .catch(() => {})
      .finally(() => setLoadingJobs(false));

    fetch(`${base}/api/profile/applications?limit=20`)
      .then((r) => r.json())
      .then((d) => setCandidates(d.applications || d || []))
      .catch(() => {})
      .finally(() => setLoadingCandidates(false));

    axios
      .get(`${base}/api/jobs`, { params: { jobFor: "handyman", limit: 20 } })
      .then(() => {})
      .catch(() => {});

    // Fetch handymen from a generic endpoint — fallback to empty
    fetch(`${base}/api/profile/applications?limit=20`)
      .then((r) => r.json())
      .then((d) => {
        // Use candidate data as placeholder for handymen since no dedicated endpoint yet
        setHandymen((d.applications || d || []).slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoadingHandymen(false));
  }, [base]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (locationFilter) params.set("location", locationFilter);
    if (category) params.set("category", category);
    if (jobType) params.set("jobType", jobType);
    window.location.href = `/findjob?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden pb-0">
        {/* subtle grid bg */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full border border-lime-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
              Nigeria's fastest-growing talent marketplace
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.08] tracking-tight mb-6">
              Find Your <br className="hidden sm:block" />
              <WordRotator />
              <br className="hidden sm:block" />
              Today
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Connecting white-collar professionals and skilled tradespeople
              with top employers across Nigeria.
            </p>
          </motion.div>

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <form
              onSubmit={handleSearch}
              className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 max-w-3xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Job title, skills or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full sm:w-40 pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-sm"
                >
                  <Search size={15} />
                  Search
                </button>
              </div>

              {/* Filter row */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                >
                  <option value="">All Categories</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
                <Link
                  href="/find-candidates"
                  className="ml-auto text-xs text-lime-700 font-semibold flex items-center gap-1 hover:text-lime-800"
                >
                  Browse Talent <ArrowRight size={12} />
                </Link>
              </div>
            </form>
          </motion.div>

          {/* Popular searches */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-gray-400 self-center">Trending:</span>
            {[
              "Software Engineer",
              "Product Manager",
              "Electrician",
              "Accountant",
              "Nurse",
            ].map((t) => (
              <Link
                key={t}
                href={`/findjob?search=${encodeURIComponent(t)}`}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-lime-50 hover:text-lime-700 transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-primary-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-xs text-primary-200 mt-1 font-medium uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS TICKER ────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Latest Openings
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Jobs posted by verified employers
              </p>
            </div>
            <Link
              href="/findjob"
              className="flex items-center gap-1.5 text-sm font-semibold text-lime-700 hover:text-lime-800"
            >
              View all <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {loadingJobs ? (
          <div className="flex gap-4 px-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Sk key={i} className="flex-shrink-0 w-72 h-32" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No jobs posted yet. Check back soon.
          </div>
        ) : (
          <ScrollTicker speed={40}>
            {jobs.map((job) => (
              <JobTickerCard key={job._id} job={job} />
            ))}
          </ScrollTicker>
        )}
      </section>

      {/* ── FEATURED CANDIDATES TICKER ─────────────────────────────────────── */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Top Candidates
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Professionals actively looking for work
              </p>
            </div>
            <Link
              href="/find-candidates"
              className="flex items-center gap-1.5 text-sm font-semibold text-lime-700 hover:text-lime-800"
            >
              View all <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {loadingCandidates ? (
          <div className="flex gap-4 px-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Sk key={i} className="flex-shrink-0 w-64 h-24" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No candidates yet.
          </div>
        ) : (
          <ScrollTicker speed={32}>
            {candidates.map((app) => (
              <CandidateTickerCard key={app._id} app={app} />
            ))}
          </ScrollTicker>
        )}
      </section>

      {/* ── FEATURED HANDYMEN TICKER ────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Skilled Tradespeople
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Verified handymen available for hire
              </p>
            </div>
            <Link
              href="/find-candidates"
              className="flex items-center gap-1.5 text-sm font-semibold text-lime-700 hover:text-lime-800"
            >
              Browse <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {loadingHandymen ? (
          <div className="flex gap-4 px-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Sk key={i} className="flex-shrink-0 w-64 h-24" />
            ))}
          </div>
        ) : (
          <ScrollTicker speed={28}>
            {(handymen.length
              ? handymen
              : [
                  {
                    _id: "1",
                    fullName: "Samuel Eze",
                    trade: "Plumber",
                    yearsExperience: 8,
                  },
                  {
                    _id: "2",
                    fullName: "Ibrahim Yusuf",
                    trade: "Electrician",
                    yearsExperience: 5,
                  },
                  {
                    _id: "3",
                    fullName: "Kelechi Obi",
                    trade: "Tiler",
                    yearsExperience: 6,
                  },
                  {
                    _id: "4",
                    fullName: "Sunday Ade",
                    trade: "Painter",
                    yearsExperience: 4,
                  },
                  {
                    _id: "5",
                    fullName: "Musa Danjuma",
                    trade: "Welder",
                    yearsExperience: 10,
                  },
                ]
            ).map((h, i) => (
              <HandymanTickerCard key={h._id || i} h={h.jobseeker || h} />
            ))}
          </ScrollTicker>
        )}
      </section>

      {/* ── WHY TALENTHQ ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Why TalentHQ?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              Built specifically for the Nigerian labour market — from
              boardrooms to building sites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_ITEMS.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary-500 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Ready to find your next opportunity?
          </h2>
          <p className="text-primary-200 mb-8 text-sm leading-relaxed">
            Join thousands of Nigerians who found their next job, their best
            hire, or their go-to tradesperson on TalentHQ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Create Free Account
            </Link>
            <Link
              href="/findjob"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-sm border border-white/20"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
