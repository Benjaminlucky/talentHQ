"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  Zap,
  Crown,
  Building2,
  User,
  Loader2,
  ArrowRight,
  Star,
  Shield,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;
const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

// NGN amount from kobo
const fmt = (kobo) =>
  kobo === 0 ? "Free" : `₦${(kobo / 100).toLocaleString()}`;

const EMPLOYER_FEATURES = {
  employer_free: [
    "2 active job posts",
    "5 candidate profile views/mo",
    "Basic analytics",
  ],
  employer_starter: [
    "10 active job posts",
    "30 candidate profile views/mo",
    "Full analytics dashboard",
    "2 job boost credits/mo",
    "Priority support",
  ],
  employer_pro: [
    "Unlimited job posts",
    "Unlimited candidate views",
    "Full analytics",
    "10 job boost credits/mo",
    "Featured employer badge",
    "Dedicated account manager",
  ],
};
const JOBSEEKER_FEATURES = {
  jobseeker_free: [
    "Apply to unlimited jobs",
    "Basic profile",
    "Standard visibility",
  ],
  jobseeker_premium: [
    "⭐ Priority badge on applications",
    "Profile analytics — who viewed you",
    "Resume boost — surfaced higher in searches",
    "Priority application status",
    "All free features",
  ],
};

function PlanCard({ plan, onSelect, loading, interval }) {
  const isPro = plan.name.includes("pro") || plan.name.includes("premium");
  const isFree = plan.priceMonthly === 0;
  const price = interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const features =
    EMPLOYER_FEATURES[plan.name] || JOBSEEKER_FEATURES[plan.name] || [];

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-7 flex flex-col transition-all ${
        isPro
          ? "border-primary-500 shadow-xl shadow-primary-500/10"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-black rounded-full flex items-center gap-1">
          <Crown size={11} /> Most Popular
        </div>
      )}

      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          {plan.displayName}
        </p>
        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-black text-gray-900">
            {isFree ? "Free" : `₦${(price / 100 / 1000).toFixed(0)}k`}
          </span>
          {!isFree && (
            <span className="text-sm text-gray-400 mb-1.5">
              /{interval === "yearly" ? "yr" : "mo"}
            </span>
          )}
        </div>
        {!isFree && interval === "yearly" && (
          <p className="text-xs text-lime-600 font-semibold mt-1">
            Save{" "}
            {Math.round(
              100 - (plan.priceYearly / (plan.priceMonthly * 12)) * 100,
            )}
            % vs monthly
          </p>
        )}
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle2
              size={15}
              className={`flex-shrink-0 mt-0.5 ${isPro ? "text-primary-500" : "text-lime-500"}`}
            />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={loading === plan._id}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition ${
          isPro
            ? "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
            : isFree
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
        } disabled:opacity-60`}
      >
        {loading === plan._id ? (
          <Loader2 size={15} className="animate-spin" />
        ) : null}
        {isFree ? (
          "Current Plan"
        ) : isPro ? (
          <>
            Get Pro <Crown size={14} />
          </>
        ) : (
          <>
            Get Started <ArrowRight size={14} />
          </>
        )}
      </button>
    </div>
  );
}

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [tab, setTab] = useState("employer");
  const [interval, setInt] = useState("monthly");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/api/payments/plans`)
      .then((r) => setPlans(r.data.plans || []))
      .catch(() => {});
  }, []);

  const filtered = plans.filter((p) => p.targetRole === tab);

  const handleSelect = async (plan) => {
    if (plan.priceMonthly === 0) return;
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }
    setLoading(plan._id);
    setError("");
    try {
      const res = await axios.post(
        `${API}/api/payments/subscription/initialize`,
        { planId: plan._id, interval },
        { withCredentials: true },
      );
      // Redirect to Paystack hosted payment page
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Payment initialization failed");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Pay in Naira. Cancel anytime. No hidden fees.
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            ["employer", Building2, "For Employers"],
            ["jobseeker", User, "For Jobseekers"],
          ].map(([r, Icon, label]) => (
            <button
              key={r}
              onClick={() => setTab(r)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${
                tab === r
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Billing interval */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setInt("monthly")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition ${interval === "monthly" ? "bg-primary-500 text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInt("yearly")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition ${interval === "yearly" ? "bg-primary-500 text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Yearly{" "}
              <span className="ml-1 text-[10px] bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded-full font-black">
                SAVE
              </span>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-600 text-sm mb-6 font-semibold">
            {error}
          </p>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {filtered.length === 0
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white rounded-2xl animate-pulse border border-gray-100"
                />
              ))
            : filtered.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onSelect={handleSelect}
                  loading={loading}
                  interval={interval}
                />
              ))}
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          {[
            {
              icon: Shield,
              title: "Secure payments",
              desc: "All transactions processed by Paystack, Nigeria's leading payment provider.",
            },
            {
              icon: Zap,
              title: "Instant activation",
              desc: "Your plan activates immediately after payment is confirmed by Paystack.",
            },
            {
              icon: Star,
              title: "Cancel anytime",
              desc: "No contracts or lock-ins. Cancel or downgrade at any time from your dashboard.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-primary-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
