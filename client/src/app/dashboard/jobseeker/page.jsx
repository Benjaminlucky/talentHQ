"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Briefcase,
  FileText,
  User,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const card = (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={20} />
        </div>
        {href && (
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-lime-500 transition-colors mt-0.5"
          />
        )}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  reviewed: {
    label: "Reviewed",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  accepted: {
    label: "Accepted",
    cls: "bg-lime-50 text-lime-700 border-lime-200",
  },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600 border-red-200" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

// ── Profile completion ─────────────────────────────────────────────────────────
function computeCompletion(profile) {
  if (!profile) return 0;
  const checks = [
    profile.fullName,
    profile.headline,
    profile.phone,
    profile.location?.city || profile.location,
    profile.linkedin,
    profile.avatar,
    profile.resume,
    profile.skills?.length > 0,
    profile.workExperience?.length > 0,
    profile.education?.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

// ── Missing items ─────────────────────────────────────────────────────────────
function missingItems(profile) {
  if (!profile) return [];
  const items = [];
  if (!profile.headline) items.push("Add a headline");
  if (!profile.avatar) items.push("Upload a profile photo");
  if (!profile.resume) items.push("Upload your resume");
  if (!profile.phone) items.push("Add your phone number");
  if (!profile.skills?.length) items.push("Add at least one skill");
  if (!profile.workExperience?.length) items.push("Add work experience");
  if (!profile.education?.length) items.push("Add education");
  return items.slice(0, 3);
}

export default function JobseekerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios
        .get(`${API}/api/profile/me/applications`, { withCredentials: true })
        .then((r) => setApplications(r.data || []))
        .catch(() => {}),
      axios
        .get(`${API}/api/profile/me`, { withCredentials: true })
        .then((r) => setProfile(r.data))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  const totalApps = applications.length;
  const activeApps = applications.filter(
    (a) => a.status === "pending" || a.status === "reviewed",
  ).length;
  const acceptedApps = applications.filter(
    (a) => a.status === "accepted",
  ).length;
  const completion = computeCompletion(profile);
  const missing = missingItems(profile);
  const recent = applications.slice(0, 4);

  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      <div className="space-y-8 max-w-6xl">
        {/* Welcome banner */}
        <div className="bg-primary-500 rounded-2xl px-6 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">
              Good to see you back 👋
            </p>
            <h1 className="text-2xl font-black">{user?.fullName}</h1>
            <p className="text-primary-200 text-sm mt-1">
              {!user?.emailVerified && (
                <span className="flex items-center gap-1.5 mt-2 text-amber-300">
                  <AlertCircle size={13} /> Email not verified —{" "}
                  <Link href="/account/settings" className="underline">
                    verify now
                  </Link>
                </span>
              )}
            </p>
          </div>
          <Link
            href="/dashboard/jobseeker/profile"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-semibold transition-colors border border-white/20"
          >
            <User size={15} /> View Profile
          </Link>
        </div>

        {/* Stats grid */}
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
              label="Total Applied"
              value={totalApps}
              color="text-blue-600 bg-blue-50"
              sub="All time"
              href="/dashboard/jobseeker/applications"
            />
            <StatCard
              icon={Clock}
              label="In Progress"
              value={activeApps}
              color="text-amber-600 bg-amber-50"
              sub="Pending + reviewing"
              href="/dashboard/jobseeker/applications"
            />
            <StatCard
              icon={CheckCircle2}
              label="Accepted"
              value={acceptedApps}
              color="text-lime-700 bg-lime-50"
              sub="Offers received"
            />
            <StatCard
              icon={TrendingUp}
              label="Profile"
              value={`${completion}%`}
              color="text-primary-600 bg-primary-50"
              sub="Complete"
              href="/dashboard/jobseeker/profile"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile completion */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">
                Profile Strength
              </h2>
              <Link
                href="/dashboard/jobseeker/profile"
                className="text-xs text-lime-700 font-semibold hover:text-lime-800 flex items-center gap-1"
              >
                Edit <ChevronRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Sk className="h-3 w-full rounded-full" />
                <Sk className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-lime-500 rounded-full transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">
                    {completion}% complete
                  </span>
                  <span
                    className={`text-xs font-semibold ${completion >= 80 ? "text-lime-700" : completion >= 50 ? "text-amber-600" : "text-red-500"}`}
                  >
                    {completion >= 80
                      ? "Strong"
                      : completion >= 50
                        ? "Getting there"
                        : "Needs work"}
                  </span>
                </div>

                {missing.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      To improve:
                    </p>
                    {missing.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recent applications */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">
                Recent Applications
              </h2>
              <Link
                href="/dashboard/jobseeker/applications"
                className="text-xs text-lime-700 font-semibold hover:text-lime-800 flex items-center gap-1"
              >
                View all <ChevronRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Sk key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <Briefcase size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No applications yet
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Start applying to track your progress here
                </p>
                <Link
                  href="/dashboard/jobseeker/applications"
                  className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition"
                >
                  Apply for a role
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {app.roleTitle}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.roleType} ·{" "}
                        {new Date(app.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                href: "/dashboard/jobseeker/applications",
                icon: Briefcase,
                label: "Apply for a Role",
              },
              {
                href: "/dashboard/jobseeker/profile",
                icon: User,
                label: "Update Profile",
              },
              { href: "/findjob", icon: Eye, label: "Browse Jobs" },
              {
                href: "/account/settings",
                icon: FileText,
                label: "Account & Security",
              },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-sm transition-all text-center group"
              >
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-lime-50 rounded-xl flex items-center justify-center transition-colors">
                  <Icon
                    size={18}
                    className="text-gray-500 group-hover:text-lime-600 transition-colors"
                  />
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
