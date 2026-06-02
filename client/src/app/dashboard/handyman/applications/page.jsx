"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  MapPin,
  Clock,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const STATUS_MAP = {
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  reviewed: {
    label: "Reviewing",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  accepted: {
    label: "Accepted",
    cls: "bg-lime-50 text-lime-700 border border-lime-200",
  },
  rejected: {
    label: "Not selected",
    cls: "bg-red-50 text-red-600 border border-red-200",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

export default function HandymanApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/profile/me/applications`, {
        withCredentials: true,
      });
      setApplications(
        Array.isArray(res.data) ? res.data : res.data?.applications || [],
      );
    } catch {
      setError("Failed to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/profile/me/applications/${id}`, {
        withCredentials: true,
      });
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setError("Failed to withdraw application.");
    } finally {
      setDeletingId(null);
    }
  };

  const total = applications.length;
  const active = applications.filter(
    (a) => a.status === "pending" || a.status === "reviewed",
  ).length;
  const accepted = applications.filter((a) => a.status === "accepted").length;

  return (
    <ProtectedRoute allowedRoles={["handyman"]}>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              My Applications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track the jobs you've applied to and their status
            </p>
          </div>
          <Link
            href="/dashboard/handyman/jobs"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition flex-shrink-0"
          >
            <Wrench size={14} /> Browse Jobs
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Summary stats */}
        {!loading && total > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-2xl font-black text-gray-900">{total}</p>
              <p className="text-xs text-gray-500 font-medium">Total applied</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-2xl font-black text-amber-600">{active}</p>
              <p className="text-xs text-gray-500 font-medium">In progress</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-2xl font-black text-lime-700">{accepted}</p>
              <p className="text-xs text-gray-500 font-medium">Accepted</p>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Sk key={i} className="h-24" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={24} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-800 mb-1">No applications yet</p>
            <p className="text-sm text-gray-500 mb-5 max-w-xs">
              Browse available jobs and apply — your applications will show up
              here so you can track their status.
            </p>
            <Link
              href="/dashboard/handyman/jobs"
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition"
            >
              Find work
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        {app.roleTitle}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span className="capitalize">{app.roleType}</span>
                      {app.preferredLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {app.preferredLocation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(app.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {app.employerMessage && (
                      <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-xs text-gray-600">
                        <CheckCircle2
                          size={13}
                          className="text-lime-500 flex-shrink-0 mt-0.5"
                        />
                        <span>
                          <strong className="text-gray-700">
                            Message from employer:
                          </strong>{" "}
                          {app.employerMessage}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(app._id)}
                    disabled={deletingId === app._id}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                    title="Withdraw application"
                  >
                    {deletingId === app._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
