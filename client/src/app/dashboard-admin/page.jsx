"use client";
import { useEffect, useState, useCallback } from "react";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Users,
  Briefcase,
  UserCheck,
  Wrench,
  Building2,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <div
      className={`bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        )}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const styles = {
    active: "bg-lime-100 text-lime-700",
    banned: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    filled: "bg-blue-100 text-blue-700",
    open: "bg-lime-100 text-lime-700",
    closed: "bg-gray-100 text-gray-600",
    employer: "bg-purple-100 text-purple-700",
    jobseeker: "bg-blue-100 text-blue-700",
    handyman: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const authStatus = useSuperAdminAuthRedirect();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // User table state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Job table state
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);

  const [activeTab, setActiveTab] = useState("overview"); // overview | users | jobs

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── Fetch metrics ──────────────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/superadmin/metrics`,
        { headers: getAuthHeader() },
      );
      setMetrics(res.data);
    } catch (err) {
      console.error("Metrics fetch error:", err);
      toast.error("Failed to load metrics");
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/superadmin/users`,
        {
          params: {
            search: userSearch,
            role: userRoleFilter === "all" ? undefined : userRoleFilter,
            page: userPage,
            limit: 10,
          },
          headers: getAuthHeader(),
        },
      );
      setUsers(res.data.users || []);
      setUserTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Users fetch error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, userRoleFilter, userPage]);

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs`,
        {
          params: { search: jobSearch, page: jobPage, limit: 10 },
        },
      );
      setJobs(res.data.jobs || []);
      setJobTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Jobs fetch error:", err);
      toast.error("Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }, [jobSearch, jobPage]);

  useEffect(() => {
    if (authStatus !== "authorized") return;
    fetchMetrics();
  }, [authStatus, fetchMetrics]);

  useEffect(() => {
    if (authStatus !== "authorized" || activeTab !== "users") return;
    fetchUsers();
  }, [authStatus, activeTab, fetchUsers]);

  useEffect(() => {
    if (authStatus !== "authorized" || activeTab !== "jobs") return;
    fetchJobs();
  }, [authStatus, activeTab, fetchJobs]);

  // ── Ban / unban user ───────────────────────────────────────────────────────
  const handleBanUser = async (userId, isBanned) => {
    if (!confirm(`${isBanned ? "Unban" : "Ban"} this user?`)) return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/superadmin/users/${userId}/ban`,
        { banned: !isBanned },
        { headers: getAuthHeader() },
      );
      toast.success(`User ${isBanned ? "unbanned" : "banned"} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Action failed. Please try again.");
    }
  };

  // ── Delete job ─────────────────────────────────────────────────────────────
  const handleDeleteJob = async (jobId) => {
    if (!confirm("Permanently delete this job posting?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${jobId}`,
        { headers: getAuthHeader() },
      );
      toast.success("Job deleted");
      fetchJobs();
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  if (authStatus !== "authorized") return null;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform overview and management
          </p>
        </div>
        <button
          onClick={() => {
            fetchMetrics();
            if (activeTab === "users") fetchUsers();
            if (activeTab === "jobs") fetchJobs();
          }}
          className="flex items-center gap-2 text-sm text-gray-600 border rounded-lg px-3 py-2 hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {["overview", "users", "jobs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition ${
              activeTab === tab
                ? "border-lime-600 text-lime-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={metrics?.totalUsers}
              icon={Users}
              color="bg-blue-50 text-blue-600"
              loading={loadingMetrics}
            />
            <StatCard
              label="Job Seekers"
              value={metrics?.totalJobseekers}
              icon={UserCheck}
              color="bg-lime-50 text-lime-600"
              loading={loadingMetrics}
            />
            <StatCard
              label="Handymen"
              value={metrics?.totalHandymen}
              icon={Wrench}
              color="bg-orange-50 text-orange-600"
              loading={loadingMetrics}
            />
            <StatCard
              label="Employers"
              value={metrics?.totalEmployers}
              icon={Building2}
              color="bg-purple-50 text-purple-600"
              loading={loadingMetrics}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Jobs"
              value={metrics?.totalJobs}
              icon={Briefcase}
              color="bg-indigo-50 text-indigo-600"
              loading={loadingMetrics}
            />
            <StatCard
              label="Active Jobs"
              value={metrics?.activeJobs}
              icon={TrendingUp}
              color="bg-emerald-50 text-emerald-600"
              loading={loadingMetrics}
            />
            <StatCard
              label="Applications"
              value={metrics?.totalApplications}
              icon={ClipboardList}
              color="bg-sky-50 text-sky-600"
              loading={loadingMetrics}
            />
            <StatCard
              label="New (7 days)"
              value={metrics?.newUsersLast7Days}
              icon={Users}
              color="bg-rose-50 text-rose-600"
              loading={loadingMetrics}
            />
          </div>

          {/* Quick nav cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Add Users",
                desc: "Manually register jobseekers, handymen, or employers",
                links: [
                  {
                    label: "Add Jobseeker",
                    href: "/dashboard-admin/candidates/add-jobseeker",
                  },
                  {
                    label: "Add Handyman",
                    href: "/dashboard-admin/candidates/add-handyman",
                  },
                  {
                    label: "Add Employer",
                    href: "/dashboard-admin/candidates/add-employer",
                  },
                ],
              },
              {
                title: "Job Management",
                desc: "Create or manage all platform job postings",
                links: [
                  {
                    label: "Post New Job",
                    href: "/dashboard-admin/jobs/new-job",
                  },
                  {
                    label: "View All Jobs",
                    href: "#",
                    action: () => setActiveTab("jobs"),
                  },
                ],
              },
              {
                title: "User Management",
                desc: "Search, view, and manage all registered users",
                links: [
                  {
                    label: "All Users",
                    href: "#",
                    action: () => setActiveTab("users"),
                  },
                ],
              },
            ].map(({ title, desc, links }) => (
              <div
                key={title}
                className="bg-white border rounded-xl p-5 space-y-3"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <div className="space-y-1.5">
                  {links.map(({ label, href, action }) =>
                    action ? (
                      <button
                        key={label}
                        onClick={action}
                        className="w-full text-left text-sm text-lime-700 hover:text-lime-800 hover:underline"
                      >
                        → {label}
                      </button>
                    ) : (
                      <a
                        key={label}
                        href={href}
                        className="block text-sm text-lime-700 hover:text-lime-800 hover:underline"
                      >
                        → {label}
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS TAB ────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setUserPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="all">All Roles</option>
              <option value="jobseeker">Jobseekers</option>
              <option value="handyman">Handymen</option>
              <option value="employer">Employers</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Registered",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                          {u.fullName}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge status={u.role} />
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={u.banned ? "banned" : "active"} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              title="View user"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBanUser(u._id, u.banned)}
                              title={u.banned ? "Unban user" : "Ban user"}
                              className={`p-1.5 rounded transition ${
                                u.banned
                                  ? "text-lime-600 hover:bg-lime-50"
                                  : "text-red-500 hover:bg-red-50"
                              }`}
                            >
                              {u.banned ? (
                                <UserCheck className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-xs text-gray-500">
                  Page {userPage} of {userTotalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="p-1.5 border rounded hover:bg-white disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setUserPage((p) => Math.min(userTotalPages, p + 1))
                    }
                    disabled={userPage === userTotalPages}
                    className="p-1.5 border rounded hover:bg-white disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── JOBS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={(e) => {
                setJobSearch(e.target.value);
                setJobPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Job Title",
                      "Company",
                      "Category",
                      "Type",
                      "Posted",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingJobs ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No jobs found.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                          {job.title}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {job.company?.companyName ||
                            job.company?.fullName ||
                            "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {job.category || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {new Date(job.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/findjob/${job._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="View job"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete job"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {jobTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-xs text-gray-500">
                  Page {jobPage} of {jobTotalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                    disabled={jobPage === 1}
                    className="p-1.5 border rounded hover:bg-white disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setJobPage((p) => Math.min(jobTotalPages, p + 1))
                    }
                    disabled={jobPage === jobTotalPages}
                    className="p-1.5 border rounded hover:bg-white disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
