"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import {
  Users,
  Briefcase,
  Building2,
  Wrench,
  PlusCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Activity,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={19} />
        </div>
        <TrendingUp size={13} className="text-gray-300" />
      </div>
      <p className="text-3xl font-black text-gray-900 mb-0.5">{value ?? "—"}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const ACTIONS = [
  {
    label: "Add Employer",
    href: "/dashboard-admin/candidates/add-employer",
    icon: Building2,
    desc: "Register a new company account",
  },
  {
    label: "Add Handyman",
    href: "/dashboard-admin/candidates/add-handyman",
    icon: Wrench,
    desc: "Add a skilled trade professional",
  },
  {
    label: "Add Jobseeker",
    href: "/dashboard-admin/candidates/add-jobseeker",
    icon: Users,
    desc: "Create a jobseeker profile",
  },
  {
    label: "Post a Job",
    href: "/dashboard-admin/jobs/new-job",
    icon: Briefcase,
    desc: "Post job under any company",
  },
];

export default function AdminDashboard() {
  const isAuthorized = useSuperAdminAuthRedirect();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthorized) return;
    // Fetch basic platform stats
    Promise.all([
      fetch(`${API}/api/employers/browse?limit=1`).then((r) => r.json()),
      fetch(`${API}/api/handymen?limit=1`).then((r) => r.json()),
      fetch(`${API}/api/jobs?limit=1`).then((r) => r.json()),
      fetch(`${API}/api/profile/applications?limit=1`).then((r) => r.json()),
    ])
      .then(([emp, hm, jobs, apps]) => {
        setStats({
          employers: emp.total || 0,
          handymen: hm.total || 0,
          jobs: jobs.total || jobs.totalJobs || 0,
          applications: apps.total || 0,
        });
      })
      .catch(() =>
        setStats({ employers: 0, handymen: 0, jobs: 0, applications: 0 }),
      )
      .finally(() => setLoading(false));
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-semibold">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Full platform control and oversight
          </p>
        </div>
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
            icon={Building2}
            label="Employers"
            value={stats?.employers}
            sub="Registered companies"
            color="bg-primary-50 text-primary-600"
          />
          <StatCard
            icon={Wrench}
            label="Handymen"
            value={stats?.handymen}
            sub="Trade professionals"
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={Briefcase}
            label="Active Jobs"
            value={stats?.jobs}
            sub="Open listings"
            color="bg-lime-50 text-lime-700"
          />
          <StatCard
            icon={Users}
            label="Applications"
            value={stats?.applications}
            sub="Total submitted"
            color="bg-blue-50 text-blue-600"
          />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
          <Activity size={15} className="text-primary-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTIONS.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors">
                <Icon
                  size={20}
                  className="text-primary-600 group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm group-hover:text-primary-700 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Platform health */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
        <h2 className="font-black text-primary-100 text-xs uppercase tracking-widest mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Employers", value: stats?.employers ?? "—" },
            { label: "Handymen", value: stats?.handymen ?? "—" },
            { label: "Open Jobs", value: stats?.jobs ?? "—" },
            { label: "Applications", value: stats?.applications ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black">{loading ? "…" : value}</p>
              <p className="text-xs text-primary-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
