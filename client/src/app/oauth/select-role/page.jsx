"use client";
// src/app/oauth/select-role/page.jsx
// New users who signed up via Google or LinkedIn land here first.
// They pick their role, we update the server, then redirect to onboarding.
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  Wrench,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const ROLES = [
  {
    id: "jobseeker",
    icon: Briefcase,
    label: "Jobseeker",
    desc: "I'm looking for a job or new opportunity",
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
    active: "border-blue-500 bg-blue-50",
    iconColor: "text-blue-600 bg-blue-100",
  },
  {
    id: "handyman",
    icon: Wrench,
    label: "Handyman / Tradesperson",
    desc: "I offer skilled trade services — plumbing, electrical, carpentry, etc.",
    color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
    active: "border-amber-500 bg-amber-50",
    iconColor: "text-amber-600 bg-amber-100",
  },
  {
    id: "employer",
    icon: Building2,
    label: "Employer / Company",
    desc: "I want to hire talent or post job listings",
    color: "border-lime-200 hover:border-lime-400 hover:bg-lime-50",
    active: "border-lime-500 bg-lime-50",
    iconColor: "text-lime-700 bg-lime-100",
  },
];

function SelectRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refetchUser } = useAuth();

  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If user already has a role (returning OAuth user) skip this page
  useEffect(() => {
    if (user && user.onboardingComplete) {
      const dash = {
        jobseeker: "/dashboard/jobseeker",
        handyman: "/dashboard/handyman",
        employer: "/dashboard/employer",
      };
      router.replace(dash[user.role] || "/dashboard/jobseeker");
    }
  }, [user, router]);

  const handleContinue = async () => {
    if (!selected) {
      setError("Please choose a role to continue.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Tell the server what role this OAuth user has chosen.
      // The server updates the user's role and migrates them to the correct
      // collection if needed (e.g. from Jobnode to Employer).
      await axios.post(
        `${API}/api/auth/oauth/set-role`,
        { role: selected },
        { withCredentials: true },
      );

      // Refresh context so user.role is updated
      await refetchUser();

      // Send to onboarding for their chosen role
      router.push(`/onboarding/${selected}?oauth=true`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to set role. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black text-gray-900">
            Talent<span className="text-lime-600">HQ</span>
          </a>
          <h1 className="text-xl font-black text-gray-900 mt-6 mb-1">
            One last thing — what are you here for?
          </h1>
          <p className="text-sm text-gray-500">
            Choose your role to set up the right account for you. You can't
            change this later without contacting support.
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3 mb-6">
          {ROLES.map(
            ({ id, icon: Icon, label, desc, color, active, iconColor }) => (
              <button
                key={id}
                onClick={() => {
                  setSelected(id);
                  setError("");
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  selected === id ? active : `bg-white ${color}`
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
                {selected === id && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ),
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4 font-semibold">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={loading || !selected}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-primary-500/20"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Setting up your account…
            </>
          ) : (
            <>
              Continue to setup <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary-600 hover:underline font-semibold"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function OAuthSelectRolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      }
    >
      <SelectRoleContent />
    </Suspense>
  );
}
