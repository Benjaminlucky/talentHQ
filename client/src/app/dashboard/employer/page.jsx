"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Briefcase,
  Users,
  CheckCircle2,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconCls }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconCls}`}
        >
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Custom tooltip for chart ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-800 mb-1 truncate max-w-[140px]">
        {label}
      </p>
      <p className="text-lime-700 font-bold">
        {payload[0].value} applicant{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
function JobStatusBadge({ status }) {
  const map = {
    open: "bg-lime-50 text-lime-700 border-lime-200",
    filled: "bg-blue-50 text-blue-700 border-blue-200",
    closed: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.open}`}
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Open"}
    </span>
  );
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Fetch jobs posted by this employer using the correct /api/jobs route
    fetch(`${API}/api/jobs?company=${user._id}&limit=20`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce(
    (acc, j) => acc + (j.applicants?.length || 0),
    0,
  );
  const hires = jobs.filter((j) => j.status === "filled").length;
  const openJobs = jobs.filter((j) => !j.status || j.status === "open").length;

  // Chart: applicants per job (last 6 jobs)
  const chartData = jobs.slice(-8).map((j) => ({
    name: j.title?.length > 18 ? j.title.slice(0, 18) + "…" : j.title,
    applicants: j.applicants?.length || 0,
  }));

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="space-y-8 max-w-6xl">
        {/* Welcome banner */}
        <div className="bg-primary-500 rounded-2xl px-6 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">
              Employer Dashboard
            </p>
            <h1 className="text-2xl font-black">
              {user?.companyName || user?.fullName}
            </h1>
            <p className="text-primary-200 text-sm mt-1">
              Manage your job listings and track applicants
            </p>
          </div>
          <Link
            href="/dashboard/employer/post-job"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-600 rounded-xl text-sm font-bold transition-colors"
          >
            <PlusCircle size={16} /> Post a Job
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Sk key={i} className="h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Briefcase}
              label="Jobs Posted"
              value={totalJobs}
              sub="All time"
              iconCls="text-blue-600 bg-blue-50"
            />
            <StatCard
              icon={Eye}
              label="Open Listings"
              value={openJobs}
              sub="Accepting applicants"
              iconCls="text-lime-700 bg-lime-50"
            />
            <StatCard
              icon={Users}
              label="Total Applicants"
              value={totalApplicants}
              sub="Across all jobs"
              iconCls="text-purple-600 bg-purple-50"
            />
            <StatCard
              icon={CheckCircle2}
              label="Successful Hires"
              value={hires}
              sub="Filled positions"
              iconCls="text-primary-600 bg-primary-50"
            />
          </div>
        )}

        {/* Chart + Recent jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <TrendingUp size={15} className="text-lime-600" />
                Applicants per Job
              </h2>
              {jobs.length > 8 && (
                <span className="text-xs text-gray-400">Last 8 jobs</span>
              )}
            </div>

            {loading ? (
              <Sk className="h-52 w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No data yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Post a job to see applicant trends
                </p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#679500"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#679500"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="applicants"
                      stroke="#679500"
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={{ r: 4, fill: "#679500", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#004b23" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent jobs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Clock size={15} className="text-lime-600" />
                Recent Job Posts
              </h2>
              <Link
                href="/dashboard/employer/post-job"
                className="text-xs text-lime-700 font-semibold hover:text-lime-800 flex items-center gap-1"
              >
                Post new <ChevronRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Sk key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <Briefcase size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No jobs posted yet
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Post your first job to start receiving applications
                </p>
                <Link
                  href="/dashboard/employer/post-job"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition"
                >
                  <PlusCircle size={13} /> Post a Job
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.slice(0, 6).map((job) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {job.applicants?.length || 0} applicant
                        {(job.applicants?.length || 0) !== 1 ? "s" : ""} ·{" "}
                        {job.location || "Location not set"}
                      </p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-bold text-gray-900 text-sm mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                href: "/dashboard/employer/post-job",
                icon: PlusCircle,
                label: "Post a Job",
                color: "group-hover:text-lime-600 group-hover:bg-lime-50",
              },
              {
                href: "/find-candidates",
                icon: Users,
                label: "Browse Candidates",
                color: "group-hover:text-blue-600 group-hover:bg-blue-50",
              },
              {
                href: "/account/settings",
                icon: CheckCircle2,
                label: "Account & Security",
                color: "group-hover:text-primary-600 group-hover:bg-primary-50",
              },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-sm transition-all text-center group"
              >
                <div
                  className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-colors ${color}`}
                >
                  <Icon size={18} className="text-gray-500 transition-colors" />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-lime-700 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
