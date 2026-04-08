"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function OAuthButton({ label, icon: Icon, onClick }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true);
        onClick();
        setTimeout(() => setLoading(false), 8000);
      }}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60 transition-all"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      ) : (
        <Icon />
      )}
      {loading ? "Redirecting…" : label}
    </button>
  );
}

const ROLES = [
  {
    value: "jobseeker",
    label: "Job Seeker",
    desc: "I'm looking for a job or career opportunity",
  },
  {
    value: "handyman",
    label: "Tradesperson",
    desc: "I offer a skilled trade or artisan service",
  },
  { value: "employer", label: "Employer", desc: "I want to hire or post jobs" },
];

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1=role select, 2=form
  const [role, setRole] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: "",
    skills: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("error");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role,
      };
      if (role === "handyman") {
        payload.skills = formData.skills.split(",").map((s) => s.trim());
        payload.location = formData.location;
      }
      if (role === "employer") {
        payload.companyName = formData.companyName;
        payload.companyWebsite = formData.companyWebsite;
      }
      await axios.post(`${API}/api/auth/signup2`, payload, {
        withCredentials: true,
      });
      setMessageType("success");
      setMessage("Account created! Redirecting to onboarding…");
      setTimeout(() => router.push(`/onboarding/${role}`), 700);
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    // OAuth signup always creates a jobseeker — user can complete onboarding to change this
    window.location.href = `${API}/api/auth/${provider}`;
  };

  const inp =
    "w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-black text-gray-900">
              Talent<span className="text-lime-600">HQ</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mt-4 mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-500">
            Free forever. No credit card required.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Step 1: Role select */}
          {step === 1 && (
            <>
              {/* Social buttons on step 1 too — defaults to jobseeker for OAuth */}
              <div className="space-y-3 mb-6">
                <OAuthButton
                  label="Sign up with Google"
                  icon={GoogleIcon}
                  onClick={() => handleOAuth("google")}
                />
                <OAuthButton
                  label="Sign up with LinkedIn"
                  icon={LinkedInIcon}
                  onClick={() => handleOAuth("linkedin")}
                />
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400 font-medium">
                    or sign up with email
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                I am signing up as a…
              </p>
              <div className="space-y-3">
                {ROLES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setRole(value);
                      setStep(2);
                    }}
                    className="w-full text-left px-4 py-3.5 border border-gray-200 rounded-xl hover:border-lime-400 hover:bg-lime-50 transition-all group"
                  >
                    <p className="font-bold text-gray-900 text-sm group-hover:text-lime-700">
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>

              <p className="text-sm text-center mt-6 text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-lime-700 font-semibold hover:text-lime-800"
                >
                  Log in
                </Link>
              </p>
            </>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => {
                    setStep(1);
                    setMessage(null);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  ← Change role
                </button>
                <span className="text-sm font-bold text-gray-900">
                  Signing up as{" "}
                  <span className="text-lime-700">
                    {ROLES.find((r) => r.value === role)?.label}
                  </span>
                </span>
              </div>

              {message && (
                <div
                  className={`mb-5 px-4 py-3 text-sm rounded-xl border ${
                    messageType === "error"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-lime-50 text-lime-700 border-lime-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={`${inp} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={`${inp} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className={`${inp} pl-9 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {role === "handyman" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Skills (comma separated)
                      </label>
                      <input
                        name="skills"
                        type="text"
                        placeholder="e.g. Plumbing, Tiling"
                        value={formData.skills}
                        onChange={handleChange}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Location
                      </label>
                      <input
                        name="location"
                        type="text"
                        placeholder="e.g. Lagos, Nigeria"
                        value={formData.location}
                        onChange={handleChange}
                        className={inp}
                      />
                    </div>
                  </>
                )}

                {role === "employer" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        name="companyName"
                        type="text"
                        placeholder="Your company name"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Company Website
                      </label>
                      <input
                        name="companyWebsite"
                        type="url"
                        placeholder="https://yourcompany.com"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        className={inp}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Creating
                      account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                By signing up you agree to our{" "}
                <a href="#" className="underline hover:text-gray-600">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-gray-600">
                  Privacy Policy
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
