"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Crown,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  TrendingUp,
  Briefcase,
  Users,
  RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const fmtNGN = (kobo) =>
  kobo === 0 ? "Free" : `₦${(kobo / 100).toLocaleString()}`;

function StatBar({ label, used, limit }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, (used / limit) * 100);
  const danger = !unlimited && pct > 80;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-600 font-semibold">{label}</span>
        <span
          className={`font-bold ${danger ? "text-red-500" : "text-gray-700"}`}
        >
          {unlimited ? "∞ Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${danger ? "bg-red-400" : "bg-lime-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function EmployerBillingPage() {
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [subRes, planRes] = await Promise.all([
        axios.get(`${API}/api/payments/subscription`, {
          withCredentials: true,
        }),
        axios.get(`${API}/api/payments/plans`),
      ]);
      setSub(subRes.data.subscription);
      setPlans(
        (planRes.data.plans || []).filter((p) => p.targetRole === "employer"),
      );
    } catch {
      setError("Failed to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpgrade = async (plan) => {
    if (plan.priceMonthly === 0) return;
    setUpgrading(plan._id);
    setError("");
    try {
      const res = await axios.post(
        `${API}/api/payments/subscription/initialize`,
        { planId: plan._id, interval: "monthly" },
        { withCredentials: true },
      );
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Payment initialization failed.");
      setUpgrading(null);
    }
  };

  const daysLeft = sub?.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt) - Date.now()) / 86400000))
    : 0;

  const isPro = sub?.planName?.includes("pro");
  const isStarter = sub?.planName?.includes("starter");

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Billing & Subscription
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your TalentHQ plan and usage
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Current plan */}
            <div
              className={`rounded-2xl border-2 p-6 ${isPro ? "border-primary-400 bg-primary-50" : isStarter ? "border-lime-300 bg-lime-50/40" : "border-gray-100 bg-white"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Current plan
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-gray-900 capitalize">
                      {sub ? sub.planName.replace("employer_", "") : "Free"}
                    </h2>
                    {isPro && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-black rounded-full">
                        <Crown size={9} /> PRO
                      </span>
                    )}
                    {isStarter && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-lime-500 text-white text-[10px] font-black rounded-full">
                        <Zap size={9} /> STARTER
                      </span>
                    )}
                  </div>
                  {sub ? (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                      <Calendar size={11} />
                      {daysLeft > 0
                        ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`
                        : "Expires today"}
                      {" · "}Renews{" "}
                      {new Date(sub.expiresAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      No active paid plan
                    </p>
                  )}
                </div>
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition flex-shrink-0"
                >
                  <Zap size={14} /> Upgrade Plan
                </Link>
              </div>

              {sub?.planId?.features && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-gray-200">
                  <StatBar
                    label="Job Posts"
                    used={sub.usage?.jobsPosted || 0}
                    limit={sub.planId.features.jobPostLimit}
                  />
                  <StatBar
                    label="Boost Credits"
                    used={sub.usage?.boostCreditsUsed || 0}
                    limit={sub.planId.features.boostCredits}
                  />
                  <StatBar
                    label="Candidate Views"
                    used={sub.usage?.candidateUnlocks || 0}
                    limit={sub.planId.features.candidateUnlocks}
                  />
                </div>
              )}

              {!sub && (
                <div className="flex items-start gap-2 mt-2 px-3 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    You're on the free plan (2 active jobs, 5 candidate
                    views/mo).{" "}
                    <Link href="/pricing" className="underline font-bold">
                      Upgrade
                    </Link>{" "}
                    to post more jobs and access premium features.
                  </span>
                </div>
              )}

              {sub && daysLeft <= 5 && daysLeft > 0 && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  Your plan expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                  .{" "}
                  <Link href="/pricing" className="underline font-bold ml-0.5">
                    Renew now
                  </Link>
                </div>
              )}
            </div>

            {/* Plan comparison */}
            <div>
              <h3 className="font-black text-gray-900 text-sm mb-4">
                Available Plans
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isCurrent =
                    sub?.planName === plan.name ||
                    (!sub && plan.priceMonthly === 0);
                  return (
                    <div
                      key={plan._id}
                      className={`bg-white rounded-2xl border p-5 ${isCurrent ? "border-primary-300 bg-primary-50/40" : "border-gray-100"}`}
                    >
                      <p className="font-black text-gray-900 text-sm mb-1">
                        {plan.displayName}
                      </p>
                      <p className="text-xl font-black text-gray-900 mb-1">
                        {fmtNGN(plan.priceMonthly)}
                        {plan.priceMonthly > 0 && (
                          <span className="text-xs font-normal text-gray-400">
                            /mo
                          </span>
                        )}
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1 mb-4">
                        <li className="flex items-center gap-1.5">
                          <Briefcase size={10} className="text-gray-400" />
                          {plan.features.jobPostLimit === -1
                            ? "Unlimited jobs"
                            : `${plan.features.jobPostLimit} active jobs`}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Users size={10} className="text-gray-400" />
                          {plan.features.candidateUnlocks === -1
                            ? "Unlimited candidate views"
                            : `${plan.features.candidateUnlocks} candidate views/mo`}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <TrendingUp size={10} className="text-gray-400" />
                          {plan.features.boostCredits === 0
                            ? "No boost credits"
                            : `${plan.features.boostCredits} boost credits/mo`}
                        </li>
                      </ul>
                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isCurrent || upgrading === plan._id}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition ${isCurrent ? "bg-gray-100 text-gray-400 cursor-default" : "bg-primary-500 hover:bg-primary-600 text-white"} disabled:opacity-60`}
                      >
                        {upgrading === plan._id ? (
                          <Loader2 size={12} className="animate-spin mx-auto" />
                        ) : isCurrent ? (
                          "✓ Current"
                        ) : (
                          "Upgrade →"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What's included */}
            {sub?.planId?.features && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 text-sm mb-4">
                  Your plan includes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    sub.planId.features.jobPostLimit === -1
                      ? "Unlimited active job posts"
                      : `Up to ${sub.planId.features.jobPostLimit} active job posts`,
                    sub.planId.features.candidateUnlocks === -1
                      ? "Unlimited candidate profile views"
                      : `${sub.planId.features.candidateUnlocks} candidate profile views/mo`,
                    sub.planId.features.boostCredits > 0
                      ? `${sub.planId.features.boostCredits} job boost credits/mo`
                      : null,
                    sub.planId.features.featuredBadge
                      ? "Featured employer badge"
                      : null,
                    sub.planId.features.analyticsAccess
                      ? "Full analytics dashboard"
                      : null,
                  ]
                    .filter(Boolean)
                    .map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-lime-500 flex-shrink-0"
                        />
                        {f}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
