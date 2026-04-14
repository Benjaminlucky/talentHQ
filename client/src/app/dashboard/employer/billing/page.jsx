"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Crown,
  Zap,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Users,
  BarChart3,
  Loader2,
  Calendar,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

function StatBar({ label, used, limit }) {
  const pct = limit === -1 ? 0 : Math.min(100, (used / limit) * 100);
  const unlimited = limit === -1;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600 font-semibold">{label}</span>
        <span
          className={`font-bold ${pct > 80 ? "text-red-500" : "text-gray-700"}`}
        >
          {unlimited ? "∞ Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-400" : "bg-lime-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function EmployerBillingPage() {
  const router = useRouter();
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/payments/subscription`, { withCredentials: true }),
      axios.get(`${API}/api/payments/plans`),
    ])
      .then(([subRes, planRes]) => {
        setSub(subRes.data.subscription);
        setPlans(
          (planRes.data.plans || []).filter((p) => p.targetRole === "employer"),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan) => {
    if (plan.priceMonthly === 0) return;
    setUpgrading(plan._id);
    try {
      const res = await axios.post(
        `${API}/api/payments/subscription/initialize`,
        { planId: plan._id, interval: "monthly" },
        { withCredentials: true },
      );
      window.location.href = res.data.authorizationUrl;
    } catch {
      setUpgrading(null);
    }
  };

  const daysLeft = sub?.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt) - Date.now()) / 86400000))
    : 0;

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Billing & Subscription
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your TalentHQ plan and usage
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Current plan */}
            <div
              className={`rounded-2xl border-2 p-6 ${
                sub?.planName?.includes("pro")
                  ? "border-primary-400 bg-primary-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Current plan
                  </p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-gray-900 capitalize">
                      {sub ? sub.planName.replace("employer_", "") : "Free"}
                    </h2>
                    {sub?.planName?.includes("pro") && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-black rounded-full">
                        <Crown size={9} /> PRO
                      </span>
                    )}
                  </div>
                  {sub && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {daysLeft > 0
                        ? `${daysLeft} days remaining`
                        : "Expires today"}
                      · Renews{" "}
                      {new Date(sub.expiresAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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

              {/* Usage */}
              {sub?.planId?.features && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
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
                <div className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  You're on the free plan. Upgrade to post more jobs and unlock
                  premium features.
                </div>
              )}
            </div>

            {/* Other plans */}
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
                      className={`bg-white rounded-2xl border p-5 ${isCurrent ? "border-primary-300 bg-primary-50/50" : "border-gray-100"}`}
                    >
                      <p className="font-black text-gray-900 text-sm mb-0.5">
                        {plan.displayName}
                      </p>
                      <p className="text-xl font-black text-gray-900 mb-3">
                        {plan.priceMonthly === 0
                          ? "Free"
                          : `₦${(plan.priceMonthly / 100).toLocaleString()}`}
                        {plan.priceMonthly > 0 && (
                          <span className="text-xs font-normal text-gray-400">
                            /mo
                          </span>
                        )}
                      </p>
                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isCurrent || upgrading === plan._id}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                          isCurrent
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-primary-500 hover:bg-primary-600 text-white"
                        } disabled:opacity-60`}
                      >
                        {upgrading === plan._id ? (
                          <Loader2 size={12} className="animate-spin mx-auto" />
                        ) : isCurrent ? (
                          "Current"
                        ) : (
                          "Upgrade →"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
