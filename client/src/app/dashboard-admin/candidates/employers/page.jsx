"use client";
export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import {
  Building2,
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
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";
const LBL =
  "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Legal","Education","Marketing",
  "Engineering","Agriculture","Operations","Sales","Logistics","Media",
  "Construction","Real Estate","Other",
];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const DESIGNATIONS = [
  "CEO","COO","HR Manager","Recruiter","Supervisor","Director","Manager","Other",
];
const NIGERIA_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
  "Sokoto","Taraba","Yobe","Zamfara",
];
const PLANS = ["employer_free", "employer_pro", "employer_premium"];

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

function PlanBadge({ plan }) {
  const free = !plan || plan.includes("_free");
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
        free
          ? "bg-gray-100 text-gray-500"
          : "bg-lime-50 text-lime-700 border border-lime-200"
      }`}
    >
      {free ? "Free" : plan.replace("employer_", "").replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}

function VerifiedBadge({ verified }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        verified
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {verified && <CheckCircle2 size={9} />}
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function SectionHeading({ label }) {
  return (
    <div className="pt-2 pb-1 border-b border-gray-100">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

function DeleteDialog({ user, onConfirm, onClose, deleting }) {
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
        <h3 className="font-black text-gray-900 text-base mb-1">
          Delete employer?
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold">
            {user.companyName || user.fullName}
          </span>{" "}
          will be permanently deleted. This cannot be undone.
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
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditModal({ user, form, setForm, onSave, onClose, saving }) {
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Building2 size={16} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-base leading-none">
                  {form.companyName || "Edit Employer"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{form.email}</p>
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
            <SectionHeading label="Account" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Full Name</label>
                <input
                  value={form.fullName || ""}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Email</label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  className={INP}
                />
              </div>
            </div>

            <SectionHeading label="Company Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={LBL}>Company Name</label>
                <input
                  value={form.companyName || ""}
                  onChange={(e) => set("companyName", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Industry</label>
                <select
                  value={form.industry || ""}
                  onChange={(e) => set("industry", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Company Size</label>
                <select
                  value={form.companySize || ""}
                  onChange={(e) => set("companySize", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="">Select Size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} employees
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>CAC Number</label>
                <input
                  value={form.cacNumber || ""}
                  onChange={(e) => set("cacNumber", e.target.value)}
                  placeholder="RC1234567"
                  className={INP}
                />
              </div>
            </div>

            <SectionHeading label="Location" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className={INP}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LBL}>Address</label>
                <input
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                  className={INP}
                />
              </div>
            </div>

            <SectionHeading label="Contact Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Phone</label>
                <input
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Company Email</label>
                <input
                  type="email"
                  value={form.companyEmail || ""}
                  onChange={(e) => set("companyEmail", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Website</label>
                <input
                  value={form.companyWebsite || ""}
                  onChange={(e) => set("companyWebsite", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>LinkedIn</label>
                <input
                  value={form.companyLinkedin || ""}
                  onChange={(e) => set("companyLinkedin", e.target.value)}
                  className={INP}
                />
              </div>
            </div>

            <SectionHeading label="Contact Person" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Name</label>
                <input
                  value={form.contactPersonName || ""}
                  onChange={(e) => set("contactPersonName", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Designation</label>
                <select
                  value={form.contactPersonDesignation || ""}
                  onChange={(e) =>
                    set("contactPersonDesignation", e.target.value)
                  }
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  <option value="">Select Role</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Email</label>
                <input
                  type="email"
                  value={form.contactPersonEmail || ""}
                  onChange={(e) => set("contactPersonEmail", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Phone</label>
                <input
                  value={form.contactPersonPhone || ""}
                  onChange={(e) => set("contactPersonPhone", e.target.value)}
                  className={INP}
                />
              </div>
            </div>

            <SectionHeading label="Account Status" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Active Plan</label>
                <select
                  value={form.activePlan || "employer_free"}
                  onChange={(e) => set("activePlan", e.target.value)}
                  className={`${INP} cursor-pointer appearance-none`}
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.emailVerified}
                    onChange={(e) => set("emailVerified", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-lime-500"
                  />
                  <span className="text-sm text-gray-700 font-semibold">
                    Email Verified
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.onboardingComplete}
                    onChange={(e) =>
                      set("onboardingComplete", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 accent-lime-500"
                  />
                  <span className="text-sm text-gray-700 font-semibold">
                    Onboarding Complete
                  </span>
                </label>
              </div>
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

export default function EmployersPage() {
  const isAuthorized = useSuperAdminAuthRedirect();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [editUser, setEditUser] = useState(null);
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const res = await axios.get(`${API}/api/superadmin/users`, {
        params: { role: "employer", search: debouncedSearch, page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      notify("Failed to load employers", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (isAuthorized) fetchUsers();
  }, [fetchUsers, isAuthorized]);

  const openEdit = async (user) => {
    setLoadingEdit(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const res = await axios.get(`${API}/api/superadmin/users/${user._id}`, {
        params: { role: "employer" },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setEditUser(res.data.user);
      setEditForm(res.data.user);
    } catch {
      notify("Failed to load employer details", "error");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("superadminToken");
      const {
        _id, __v, createdAt, updatedAt, password,
        oauthProvider, oauthId, ...updates
      } = editForm;
      await axios.patch(
        `${API}/api/superadmin/users/${editUser._id}`,
        { role: "employer", ...updates },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      setEditUser(null);
      notify("Employer updated successfully");
      fetchUsers();
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to update employer",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("superadminToken");
      await axios.delete(
        `${API}/api/superadmin/users/${deleteTarget._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      setDeleteTarget(null);
      notify("Employer deleted successfully");
      fetchUsers();
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to delete employer",
        "error",
      );
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
            <Building2 size={22} className="text-primary-500" /> Employers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} employer{total !== 1 ? "s" : ""} registered on the platform
          </p>
        </div>
        <Link href="/dashboard-admin/candidates/add-employer">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition shadow-sm shadow-primary-500/20">
            <Plus size={15} /> Add Employer
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white placeholder:text-gray-400 transition"
          />
        </div>
        <button
          onClick={fetchUsers}
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
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <Building2 size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">
              No employers found
            </h3>
            <p className="text-sm text-gray-400">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : "No employers registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "Company",
                    "Email",
                    "Industry",
                    "State",
                    "Plan",
                    "Verified",
                    "Joined",
                    "",
                  ].map((h) => (
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
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {user.logo ? (
                          <img
                            src={user.logo}
                            alt=""
                            className="w-8 h-8 rounded-lg object-contain bg-gray-50 flex-shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-primary-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 leading-none truncate max-w-[160px]">
                            {user.companyName || "—"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                            {user.fullName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[180px]">
                      <span className="truncate block">{user.email}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {user.industry || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {user.state || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <PlanBadge plan={user.activePlan} />
                    </td>
                    <td className="px-4 py-3.5">
                      <VerifiedBadge verified={user.emailVerified} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(user)}
                          disabled={loadingEdit}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition disabled:opacity-40"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
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
        {editUser && (
          <EditModal
            user={editUser}
            form={editForm}
            setForm={setEditForm}
            onSave={handleSave}
            onClose={() => setEditUser(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            user={deleteTarget}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
