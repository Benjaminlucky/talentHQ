"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Crown,
  Star,
  BarChart3,
  Zap,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const BENEFITS = [
  {
    icon: Star,
    title: "Priority Badge",
    desc: "Your applications get a ⭐ badge visible to employers, signalling you're a serious candidate.",
  },
  {
    icon: BarChart3,
    title: "Profile Analytics",
    desc: "See who viewed your profile, which companies looked you up, and how your applications perform.",
  },
  {
    icon: Zap,
    title: "Resume Boost",
    desc: "Your profile surfaces higher in employer candidate searches for your category.",
  },
  {
    icon: Shield,
    title: "Priority Application",
    desc: "Your applications appear at the top of the employer's pipeline in supported job posts.",
  },
];

export default function JobseekerUpgradePage() {
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [sub, setSub] = useState(null);
  const [interval, setInt] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/payments/plans`),
      axios.get(`${API}/api/payments/subscription`, { withCredentials: true }),
    ])
      .then(([plansRes, subRes]) => {
        const premium = (plansRes.data.plans || []).find(
          (p) => p.name === "jobseeker_premium",
        );
        setPlan(premium || null);
        setSub(subRes.data.subscription);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const price = plan
    ? (interval === "yearly" ? plan.priceYearly : plan.priceMonthly) / 100
    : 0;

  const handleUpgrade = async () => {
    if (!plan) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/payments/subscription/initialize`,
        { planId: plan._id, interval },
        { withCredentials: true },
      );
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const isActive =
    sub?.planName === "jobseeker_premium" && sub?.status === "active";

  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Upgrade to Premium
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stand out to employers and land your next role faster
          </p>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : isActive ? (
          <div className="bg-primary-50 border-2 border-primary-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto">
              <Crown size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900">
              You're Premium! 🎉
            </h2>
            <p className="text-sm text-gray-600">
              Your premium features are active until{" "}
              <strong>
                {new Date(sub.expiresAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              .
            </p>
            <p className="text-xs text-gray-400">
              All premium benefits are automatically applied to your profile and
              applications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Benefits list */}
            <div className="lg:col-span-3 space-y-4">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100"
                >
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-0.5">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={18} className="text-primary-600" />
                  <p className="font-black text-gray-900">Premium Plan</p>
                </div>

                {/* Billing toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                  {["monthly", "yearly"].map((i) => (
                    <button
                      key={i}
                      onClick={() => setInt(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${interval === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                    >
                      {i === "yearly" ? "Yearly (save)" : "Monthly"}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <p className="text-3xl font-black text-gray-900">
                    ₦{price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400">
                      /{interval === "yearly" ? "yr" : "mo"}
                    </span>
                  </p>
                  {interval === "yearly" && plan && (
                    <p className="text-xs text-lime-600 font-semibold mt-0.5">
                      Save ₦
                      {(
                        (plan.priceMonthly * 12 - plan.priceYearly) /
                        100
                      ).toLocaleString()}{" "}
                      vs monthly
                    </p>
                  )}
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={loading || !plan}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20 mb-3"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      Pay with Paystack
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  Payments processed securely by Paystack. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
