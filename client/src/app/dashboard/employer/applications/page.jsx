"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Search,
  Filter,
  X,
  ChevronRight,
  MapPin,
  Briefcase,
  Globe,
  Linkedin,
  Github,
  GraduationCap,
  Award,
  Code2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  MessageSquare,
  Loader2,
  AlertCircle,
  User,
  FileText,
  ExternalLink,
  Star,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = [
  { key: "all", label: "All", color: "bg-gray-100 text-gray-700" },
  {
    key: "pending",
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    key: "reviewed",
    label: "Reviewing",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  {
    key: "accepted",
    label: "Accepted",
    color: "bg-lime-50 text-lime-700 border border-lime-200",
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "bg-red-50 text-red-600 border border-red-200",
  },
];

const STATUS_ACTIONS = [
  {
    status: "reviewed",
    label: "Mark Reviewing",
    icon: Eye,
    cls: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    status: "accepted",
    label: "Accept",
    icon: CheckCircle2,
    cls: "bg-lime-600 hover:bg-lime-700 text-white",
  },
  {
    status: "rejected",
    label: "Reject",
    icon: XCircle,
    cls: "bg-red-600 hover:bg-red-700 text-white",
  },
  {
    status: "pending",
    label: "Reset to Pending",
    icon: Clock,
    cls: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.key === status) || STATUSES[1];
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.color}`}
    >
      {s.label}
    </span>
  );
}

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
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

// ── Skeleton cards ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Sk className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Sk className="h-3.5 w-36" />
          <Sk className="h-3 w-24" />
        </div>
        <Sk className="h-6 w-20 rounded-full" />
      </div>
      <Sk className="h-3 w-full mb-1.5" />
      <Sk className="h-3 w-2/3" />
    </div>
  );
}

// ── Application card ──────────────────────────────────────────────────────────
function AppCard({ app, onOpen }) {
  const name = app.jobseeker?.fullName || "Candidate";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    typeof app.jobseeker?.location === "object"
      ? [app.jobseeker.location.city, app.jobseeker.location.country]
          .filter(Boolean)
          .join(", ")
      : app.jobseeker?.location || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={() => onOpen(app)}
      className="bg-white rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-md p-4 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {app.jobseeker?.avatar ? (
            <img
              src={app.jobseeker.avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-lime-700 transition-colors">
              {name}
            </p>
            {app.jobseeker?.headline && (
              <p className="text-xs text-gray-500 truncate">
                {app.jobseeker.headline}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <p className="text-sm font-semibold text-primary-600 mb-2">
        {app.roleTitle}
      </p>

      {app.coverLetter && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {app.coverLetter}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {app.roleType && (
            <span className="flex items-center gap-1">
              <Briefcase size={10} />
              {app.roleType}
            </span>
          )}
          {locationStr && (
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {locationStr}
            </span>
          )}
        </div>
        <span>
          {new Date(app.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {app.employerMessage && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
          <MessageSquare
            size={11}
            className="text-lime-600 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-gray-500 line-clamp-1 italic">
            {app.employerMessage}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Candidate drawer ───────────────────────────────────────────────────────────
function CandidateDrawer({ app, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [actionStatus, setActionStatus] = useState(app.status);
  const [message, setMessage] = useState(app.employerMessage || "");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const js = app.jobseeker || {};
  const name = js.fullName || "Candidate";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    typeof js.location === "object"
      ? [js.location.area, js.location.city, js.location.country]
          .filter(Boolean)
          .join(", ")
      : js.location || "";

  const handleAction = async (status) => {
    // For accept/reject, show message box first
    if (status === "accepted" || status === "rejected") {
      setPendingAction(status);
      setShowMessageBox(true);
      return;
    }
    await submitUpdate(status, message);
  };

  const submitUpdate = async (status, msg) => {
    setUpdating(true);
    try {
      await axios.put(
        `${API}/api/profile/applications/${app._id}/status`,
        { status, employerMessage: msg },
        { withCredentials: true },
      );
      setActionStatus(status);
      setShowMessageBox(false);
      setPendingAction(null);
      onStatusUpdate(app._id, status, msg);
    } finally {
      setUpdating(false);
    }
  };

  const portfolioLinks = Array.isArray(js.portfolioLinks || app.portfolioLinks)
    ? js.portfolioLinks || app.portfolioLinks
    : typeof (js.portfolioLinks || app.portfolioLinks) === "string"
      ? (js.portfolioLinks || app.portfolioLinks)
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-gray-50 w-full max-w-xl h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {js.avatar ? (
              <img
                src={js.avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
            <div>
              <p className="font-black text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-500">{app.roleTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={actionStatus} />
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Action buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">
              Update Application Status
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_ACTIONS.filter((a) => a.status !== actionStatus).map(
                ({ status, label, icon: Icon, cls }) => (
                  <button
                    key={status}
                    onClick={() => handleAction(status)}
                    disabled={updating}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-xs transition-colors disabled:opacity-50 ${cls}`}
                  >
                    {updating && pendingAction === status ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Icon size={13} />
                    )}
                    {label}
                  </button>
                ),
              )}
            </div>

            {/* Quick message for reviewed */}
            {actionStatus !== "accepted" && actionStatus !== "rejected" && (
              <button
                onClick={() => setShowMessageBox((v) => !v)}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-lime-400 hover:text-lime-700 transition-colors"
              >
                <MessageSquare size={12} />
                {showMessageBox
                  ? "Hide message box"
                  : "Add a message to candidate"}
              </button>
            )}

            {/* Message + confirm for accept/reject */}
            <AnimatePresence>
              {showMessageBox && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {pendingAction && (
                      <div
                        className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                          pendingAction === "accepted"
                            ? "bg-lime-50 text-lime-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        Confirming:{" "}
                        {pendingAction === "accepted"
                          ? "✓ Accepting"
                          : "✗ Rejecting"}{" "}
                        this application
                      </div>
                    )}
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        pendingAction === "accepted"
                          ? "Congratulations! We'd love to have you join our team..."
                          : pendingAction === "rejected"
                            ? "Thank you for your interest. Unfortunately..."
                            : "Add a note for the candidate (optional)..."
                      }
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50"
                    />
                    {pendingAction && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitUpdate(pendingAction, message)}
                          disabled={updating}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-colors ${
                            pendingAction === "accepted"
                              ? "bg-lime-600 hover:bg-lime-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                        >
                          {updating ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : null}
                          {pendingAction === "accepted"
                            ? "Confirm Accept"
                            : "Confirm Reject"}
                        </button>
                        <button
                          onClick={() => {
                            setPendingAction(null);
                            setShowMessageBox(false);
                          }}
                          className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {app.employerMessage && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                  Previous message sent
                </p>
                <p className="text-xs text-gray-600 italic">
                  {app.employerMessage}
                </p>
              </div>
            )}
          </div>

          {/* Application details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <FileText size={14} className="text-lime-600" /> Application
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                    Role
                  </p>
                  <p className="font-bold text-primary-700 mt-0.5">
                    {app.roleTitle}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                    Type
                  </p>
                  <p className="text-gray-700 font-medium mt-0.5">
                    {app.roleType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-gray-700 font-medium mt-0.5">
                    {app.preferredLocation || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                    Applied
                  </p>
                  <p className="text-gray-700 font-medium mt-0.5">
                    {new Date(app.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {app.coverLetter && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                    Cover Letter
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {app.coverLetter}
                  </p>
                </div>
              )}

              {portfolioLinks.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                    Portfolio
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-lime-700 hover:underline px-2 py-1 bg-lime-50 rounded-lg"
                      >
                        <ExternalLink size={10} />
                        {link.replace(/^https?:\/\//, "").slice(0, 28)}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Candidate profile */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <User size={14} className="text-lime-600" /> Candidate Profile
            </h3>

            <div className="space-y-3 text-sm">
              {js.headline && (
                <p className="text-gray-700 font-medium">{js.headline}</p>
              )}
              {js.tagline && (
                <p className="text-xs text-gray-500 italic">{js.tagline}</p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                {js.email && (
                  <a
                    href={`mailto:${js.email}`}
                    className="flex items-center gap-1 hover:text-lime-700"
                  >
                    {js.email}
                  </a>
                )}
                {locationStr && (
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {locationStr}
                  </span>
                )}
                {js.linkedin && (
                  <a
                    href={js.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Linkedin size={10} />
                    LinkedIn
                  </a>
                )}
                {js.github && (
                  <a
                    href={js.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <Github size={10} />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {js.skill?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Code2 size={14} className="text-lime-600" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {js.skill.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 bg-lime-50 text-lime-700 rounded-full border border-lime-100 font-medium"
                  >
                    {s.name}
                    {s.level ? ` · ${s.level}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {js.workExperience?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <Briefcase size={14} className="text-lime-600" /> Experience
              </h3>
              <div className="space-y-4">
                {js.workExperience.map((w, i) => (
                  <div
                    key={i}
                    className={
                      i < js.workExperience.length - 1
                        ? "pb-4 border-b border-gray-100"
                        : ""
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {w.jobTitle}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {w.company}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 text-right flex-shrink-0 ml-3">
                        {w.startDate?.slice(0, 7)} —{" "}
                        {w.endDate ? w.endDate.slice(0, 7) : "Present"}
                      </p>
                    </div>
                    {w.description && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        {w.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {js.education?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <GraduationCap size={14} className="text-lime-600" /> Education
              </h3>
              <div className="space-y-3">
                {js.education.map((e, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {e.degree}
                      </p>
                      <p className="text-xs text-gray-500">{e.institution}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-3">
                      {e.graduationYear ||
                        (e.graduationDate
                          ? new Date(e.graduationDate).getFullYear()
                          : "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {js.certifications?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Award size={14} className="text-lime-600" /> Certifications
              </h3>
              <div className="space-y-2">
                {js.certifications.map((c, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {c.title}
                      </p>
                      {c.organization && (
                        <p className="text-xs text-gray-500">
                          {c.organization}
                        </p>
                      )}
                    </div>
                    {c.dateEarned && (
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-3">
                        {new Date(c.dateEarned).toLocaleDateString("en-NG", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (activeStatus !== "all") params.status = activeStatus;
      if (search) params.search = search;
      const res = await axios.get(`${API}/api/profile/applications`, {
        params,
        withCredentials: true,
      });
      setApplications(res.data.applications || res.data || []);
    } catch {
      notify("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search]);

  useEffect(() => {
    const t = setTimeout(fetchApplications, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchApplications]);

  const openDetail = async (app) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API}/api/profile/applications/${app._id}`);
      setSelected(res.data);
    } catch {
      notify("Failed to load candidate details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusUpdate = (id, status, message) => {
    setApplications((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, status, employerMessage: message } : a,
      ),
    );
    if (selected?._id === id) {
      setSelected((prev) => ({ ...prev, status, employerMessage: message }));
    }
    notify(
      `Application ${status === "accepted" ? "accepted ✓" : status === "rejected" ? "rejected" : `marked as ${status}`}`,
    );
  };

  // Count per status for tabs
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="space-y-6 max-w-6xl">
        <AnimatePresence>
          {toast && <Toast message={toast.msg} type={toast.type} />}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Applications Pipeline
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review candidates and manage your hiring decisions
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-black text-2xl text-primary-600">
              {counts.all}
            </span>
            <span>total applications</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by candidate name, role, or headline…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveStatus(key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeStatus === key
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {label} <span className="opacity-70 ml-1">({counts[key]})</span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {loadingDetail && (
          <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-5 flex items-center gap-3 shadow-xl">
              <Loader2 size={20} className="animate-spin text-lime-600" />
              <span className="text-sm font-semibold text-gray-700">
                Loading candidate…
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <User size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">
              {activeStatus === "all"
                ? "No applications yet"
                : `No ${activeStatus} applications`}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {activeStatus === "all"
                ? "Applications submitted by candidates will appear here."
                : `No applications have been marked as "${activeStatus}" yet.`}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <AppCard key={app._id} app={app} onOpen={openDetail} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Candidate drawer */}
        <AnimatePresence>
          {selected && (
            <CandidateDrawer
              app={selected}
              onClose={() => setSelected(null)}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
