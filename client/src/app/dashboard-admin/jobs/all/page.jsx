"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import {
  Briefcase,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  MapPin,
  Building2,
  Calendar,
  Tag,
  DollarSign,
  Phone,
  Info,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";
const LBL =
  "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide";

const CATEGORIES = [
  "Technology","Finance","Marketing","Design","Sales","Healthcare",
  "Engineering","Education","Administration","Accounting","Legal",
  "Operations","Human Resources","Plumbing","Electrical","Carpentry",
  "Tiling","Painting","Welding","Masonry","AC Repair","Other",
];
const NIGERIA_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue",
  "Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT",
  "Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
  "Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];
const STATUS_OPTIONS = ["open", "filled", "closed", "paused"];

const STATUS_STYLES = {
  open:   "bg-green-50 text-green-700 border-green-200",
  filled: "bg-blue-50  text-blue-700  border-blue-200",
  closed: "bg-red-50   text-red-700   border-red-200",
  paused: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

function Toast({ message, type }) {
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
        type === "error" ? "bg-red-600 text-white" : "bg-lime-600 text-white"
      }`}
    >
      {type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      {message}
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls} capitalize`}>
      {status || "—"}
    </span>
  );
}

function SectionHeading({ label }) {
  return (
    <div className="pt-2 pb-1 border-b border-gray-100">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function DeleteDialog({ job, onConfirm, onClose, deleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="font-black text-gray-900 text-base mb-1">Delete job?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold">{job.title}</span> will be permanently
          deleted. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition disabled:opacity-60"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditModal({ job, form, setForm, onSave, onClose, saving }) {
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Briefcase size={16} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-base leading-none">
                  {form.title || "Edit Job"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {job.company?.companyName || "No company"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <SectionHeading label="Job Details" />
            <div>
              <label className={LBL}>Job Title *</label>
              <input
                value={form.title || ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Senior React Developer"
                className={INP}
              />
            </div>
            <div>
              <label className={LBL}>Description *</label>
              <textarea
                rows={4}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the role…"
                className={`${INP} resize-none`}
              />
            </div>
            <div>
              <label className={LBL}>Responsibilities</label>
              <textarea
                rows={3}
                value={form.responsibilities || ""}
                onChange={(e) => set("responsibilities", e.target.value)}
                placeholder="Comma-separated"
                className={`${INP} resize-none`}
              />
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Info size={10} /> Comma-separated
              </p>
            </div>
            <div>
              <label className={LBL}>Qualification</label>
              <input
                value={form.qualification || ""}
                onChange={(e) => set("qualification", e.target.value)}
                placeholder="e.g. B.Sc. Computer Science, 3+ years exp"
                className={INP}
              />
            </div>

            <SectionHeading label="Skills & Benefits" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Required Skills</label>
                <input
                  value={form.skills || ""}
                  onChange={(e) => set("skills", e.target.value)}
                  placeholder="React, Node.js, TypeScript"
                  className={INP}
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
              </div>
              <div>
                <label className={LBL}>Benefits</label>
                <input
                  value={form.benefits || ""}
                  onChange={(e) => set("benefits", e.target.value)}
                  placeholder="Health insurance, Remote option"
                  className={INP}
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
              </div>
            </div>

            <SectionHeading label="Type, Status & Compensation" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Status</label>
                <select
                  value={form.status || "open"}
                  onChange={(e) => set("status", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Job Type</label>
                <select
                  value={form.type || "Full-time"}
                  onChange={(e) => set("type", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className={LBL}>Posted For</label>
                <select
                  value={form.jobFor || "professional"}
                  onChange={(e) => set("jobFor", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="professional">Professional / White Collar</option>
                  <option value="handyman">Handyman / Trade</option>
                </select>
              </div>
              <div>
                <label className={LBL}>Category</label>
                <select
                  value={form.category || ""}
                  onChange={(e) => set("category", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Experience Level</label>
                <select
                  value={form.experienceLevel || ""}
                  onChange={(e) => set("experienceLevel", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="">Select Level</option>
                  <option value="0-1 years">0–1 years (Entry)</option>
                  <option value="1-3 years">1–3 years</option>
                  <option value="2-4 years">2–4 years (Mid)</option>
                  <option value="4-6 years">4–6 years (Senior)</option>
                  <option value="6+ years">6+ years</option>
                </select>
              </div>
              <div>
                <label className={LBL}>Salary Range (₦)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                  <input
                    value={form.salary || ""}
                    onChange={(e) => set("salary", e.target.value)}
                    placeholder="200,000 – 400,000"
                    className={`${INP} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={LBL}>Application Deadline</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={form.deadline ? form.deadline.split("T")[0] : ""}
                    onChange={(e) => set("deadline", e.target.value)}
                    className={`${INP} pl-9`}
                  />
                </div>
              </div>
            </div>

            <SectionHeading label="Location & Contact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>City / Location *</label>
                <input
                  value={form.location || ""}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Victoria Island, Lagos"
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>State</label>
                <select
                  value={form.state || ""}
                  onChange={(e) => set("state", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="">Select State</option>
                  {NIGERIA_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>LGA</label>
                <input
                  value={form.lga || ""}
                  onChange={(e) => set("lga", e.target.value)}
                  placeholder="Local Government Area"
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Contact Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={form.phoneNumber || ""}
                    onChange={(e) => set("phoneNumber", e.target.value)}
                    placeholder="08012345678"
                    className={`${INP} pl-9`}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={LBL}>Full Address</label>
                <input
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Street address, building, area"
                  className={INP}
                />
              </div>
            </div>

            <SectionHeading label="Listing Flags" />
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-lime-500"
                />
                <span className="text-sm text-gray-700 font-semibold">Featured</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.boosted}
                  onChange={(e) => set("boosted", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-lime-500"
                />
                <span className="text-sm text-gray-700 font-semibold">Boosted</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition disabled:opacity-60 shadow-sm shadow-primary-500/20"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function AllJobsPage() {
  const isAuthorized = useSuperAdminAuthRedirect();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const res = await axios.get(`${API}/api/superadmin/jobs`, {
        params: { search: debouncedSearch, status: statusFilter, page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      notify("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    if (isAuthorized) fetchJobs();
  }, [fetchJobs, isAuthorized]);

  const openEdit = async (job) => {
    setLoadingEdit(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const res = await axios.get(`${API}/api/superadmin/jobs/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setEditJob(res.data.job);
      setEditForm(res.data.job);
    } catch {
      notify("Failed to load job details", "error");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.title?.trim() || !editForm.location?.trim()) {
      notify("Title and location are required", "error");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const { _id, __v, createdAt, updatedAt, company, postedBy, ...updates } = editForm;
      await axios.patch(
        `${API}/api/superadmin/jobs/${editJob._id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true },
      );
      setEditJob(null);
      notify("Job updated successfully");
      fetchJobs();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update job", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("superadminToken");
      await axios.delete(`${API}/api/superadmin/jobs/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setDeleteTarget(null);
      notify("Job deleted successfully");
      fetchJobs();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete job", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Briefcase size={22} className="text-primary-500" /> All Jobs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} job{total !== 1 ? "s" : ""} on the platform
          </p>
        </div>
        <Link href="/dashboard-admin/jobs/new-job">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition shadow-sm shadow-primary-500/20">
            <Plus size={15} /> Post New Job
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or location…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white placeholder:text-gray-400 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 cursor-pointer appearance-none font-semibold text-gray-700"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <button
          onClick={fetchJobs}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Briefcase size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">No jobs found</h3>
            <p className="text-sm text-gray-400">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : statusFilter !== "all"
                ? `No ${statusFilter} jobs at this time.`
                : "No jobs have been posted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Title", "Company", "Status", "Type", "For", "Location", "Category", "Posted", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={13} className="text-primary-500" />
                        </div>
                        <p className="font-bold text-gray-900 truncate max-w-[180px]">{job.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt=""
                            className="w-6 h-6 rounded object-contain border border-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Building2 size={11} className="text-gray-400" />
                          </div>
                        )}
                        <span className="text-gray-600 truncate text-xs font-semibold">
                          {job.company?.companyName || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">{job.type || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs capitalize">{job.jobFor || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap max-w-[120px]">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{job.location || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {job.category ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                          <Tag size={9} /> {job.category}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(job)}
                          disabled={loadingEdit}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition disabled:opacity-40"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(job)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm text-gray-600 font-semibold px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editJob && (
          <EditModal
            job={editJob}
            form={editForm}
            setForm={setEditForm}
            onSave={handleSave}
            onClose={() => setEditJob(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            job={deleteTarget}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
