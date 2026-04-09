"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  ChevronDown,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Users,
  Calendar,
  MoreVertical,
  X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open: {
    label: "Open",
    cls: "bg-lime-50 text-lime-700 border-lime-200",
    dot: "bg-lime-500",
  },
  filled: {
    label: "Filled",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  paused: {
    label: "Paused",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  closed: {
    label: "Closed",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
};

const STATUS_ACTIONS = [
  {
    status: "open",
    label: "Mark as Open",
    icon: Unlock,
    cls: "text-lime-700 hover:bg-lime-50",
  },
  {
    status: "filled",
    label: "Mark as Filled",
    icon: CheckCircle2,
    cls: "text-blue-700 hover:bg-blue-50",
  },
  {
    status: "paused",
    label: "Pause Listing",
    icon: EyeOff,
    cls: "text-amber-700 hover:bg-amber-50",
  },
  {
    status: "closed",
    label: "Close Listing",
    icon: Lock,
    cls: "text-gray-600 hover:bg-gray-100",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
        type === "error" ? "bg-red-600 text-white" : "bg-lime-600 text-white"
      }`}
    >
      {type === "error" ? (
        <AlertCircle size={15} />
      ) : (
        <CheckCircle2 size={15} />
      )}
      {message}
    </motion.div>
  );
}

// ── Status dropdown ───────────────────────────────────────────────────────────
function StatusDropdown({ job, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus) => {
    if (newStatus === job.status) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(false);
    try {
      await axios.patch(
        `${API}/api/jobs/${job._id}/status`,
        { status: newStatus },
        { withCredentials: true },
      );
      onUpdate(job._id, newStatus);
    } catch (err) {
      onUpdate(
        job._id,
        job.status,
        err.response?.data?.message || "Failed to update",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-xs font-semibold text-gray-700 transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <>
            <span
              className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[job.status]?.dot || "bg-lime-500"}`}
            />
            {STATUS_CONFIG[job.status]?.label || "Open"}
            <ChevronDown
              size={12}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20"
            >
              {STATUS_ACTIONS.filter((a) => a.status !== job.status).map(
                ({ status, label, icon: Icon, cls }) => (
                  <button
                    key={status}
                    onClick={() => handleChange(status)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition ${cls}`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ),
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ job, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Delete this job?</h3>
        <p className="text-sm text-gray-500 mb-6">
          <strong>{job.title}</strong> will be permanently removed. All related
          data will be lost.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Job card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onStatusUpdate, onDelete }) {
  const daysAgo = Math.max(
    0,
    Math.floor((Date.now() - new Date(job.createdAt)) / 86400000),
  );
  const deadline = job.deadline ? new Date(job.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000))
    : null;
  const isExpired = deadline && deadline < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
            <StatusBadge status={job.status} />
            {isExpired && job.status === "open" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                Deadline passed
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {job.location}
              </span>
            )}
            {job.type && (
              <span className="flex items-center gap-1">
                <Briefcase size={10} />
                {job.type}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1 text-lime-700 font-semibold">
                <DollarSign size={10} />₦{job.salary}
              </span>
            )}
            {job.category && (
              <span className="flex items-center gap-1">
                <Tag size={10} />
                {job.category}
              </span>
            )}
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusDropdown job={job} onUpdate={onStatusUpdate} />
          <button
            onClick={() => onDelete(job)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {daysAgo === 0 ? "Posted today" : `Posted ${daysAgo}d ago`}
          </span>
          {daysLeft !== null && (
            <span
              className={`flex items-center gap-1 font-semibold ${
                isExpired
                  ? "text-red-400"
                  : daysLeft < 5
                    ? "text-amber-500"
                    : "text-gray-400"
              }`}
            >
              <Calendar size={10} />
              {isExpired ? "Expired" : `${daysLeft}d left`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="capitalize px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 font-medium">
            {job.jobFor === "handyman" ? "Trades" : "Professional"}
          </span>
          <Link
            href={`/findjob/${job._id}`}
            target="_blank"
            className="flex items-center gap-1 text-lime-700 hover:underline font-semibold"
          >
            <Eye size={10} /> Preview
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EmployerMyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get(`${API}/api/jobs/me/posted`, {
        params,
        withCredentials: true,
      });
      setJobs(res.data.jobs || []);
    } catch {
      notify("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStatusUpdate = (id, newStatus, errMsg) => {
    if (errMsg) {
      notify(errMsg, "error");
      return;
    }
    setJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, status: newStatus } : j)),
    );
    notify(`Job marked as ${newStatus}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/jobs/${deleteTarget._id}`, {
        withCredentials: true,
      });
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      notify("Job deleted");
      setDeleteTarget(null);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  const STATUS_TABS = ["all", "open", "paused", "filled", "closed"];
  const counts = STATUS_TABS.reduce(
    (acc, s) => ({
      ...acc,
      [s]:
        s === "all" ? jobs.length : jobs.filter((j) => j.status === s).length,
    }),
    {},
  );

  const summaryStats = {
    total: jobs.length,
    open: jobs.filter((j) => j.status === "open").length,
    filled: jobs.filter((j) => j.status === "filled").length,
    paused: jobs.filter((j) => j.status === "paused").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="space-y-6 max-w-5xl">
        <AnimatePresence>
          {toast && <Toast message={toast.msg} type={toast.type} />}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              My Job Listings
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {summaryStats.total} total · {summaryStats.open} open ·{" "}
              {summaryStats.filled} filled
            </p>
          </div>
          <Link
            href="/dashboard/employer/post-job"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            <PlusCircle size={16} /> Post New Job
          </Link>
        </div>

        {/* Summary cards */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Open",
                count: summaryStats.open,
                cls: "text-lime-600 bg-lime-50",
                border: "border-lime-100",
              },
              {
                label: "Paused",
                count: summaryStats.paused,
                cls: "text-amber-600 bg-amber-50",
                border: "border-amber-100",
              },
              {
                label: "Filled",
                count: summaryStats.filled,
                cls: "text-blue-600 bg-blue-50",
                border: "border-blue-100",
              },
              {
                label: "Closed",
                count: summaryStats.closed,
                cls: "text-gray-500 bg-gray-50",
                border: "border-gray-100",
              },
            ].map(({ label, count, cls, border }) => (
              <div
                key={label}
                className={`bg-white rounded-2xl border ${border} p-4 text-center`}
              >
                <p className={`text-2xl font-black ${cls.split(" ")[0]}`}>
                  {count}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                statusFilter === s
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label} ({counts[s] || 0})
            </button>
          ))}
        </div>

        {/* Status change legend */}
        <div className="flex flex-wrap gap-4 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">
            Change status via dropdown on each card:
          </span>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${cfg.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          ))}
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Sk key={i} className="h-36" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">
              {statusFilter === "all"
                ? "No jobs posted yet"
                : `No ${statusFilter} jobs`}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              {statusFilter === "all"
                ? "Post your first job to start receiving applications."
                : `You have no jobs with "${statusFilter}" status.`}
            </p>
            {statusFilter === "all" && (
              <Link
                href="/dashboard/employer/post-job"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition"
              >
                <PlusCircle size={15} /> Post a Job
              </Link>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteTarget && (
            <DeleteConfirm
              job={deleteTarget}
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(null)}
              loading={deleting}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
