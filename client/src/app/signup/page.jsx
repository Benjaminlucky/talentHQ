"use client";
// src/app/signup/page.jsx
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Wrench,
  Building2,
  ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;
const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";

const ROLES = [
  {
    id: "jobseeker",
    icon: Briefcase,
    label: "Jobseeker",
    desc: "I'm looking for work",
    color: "border-blue-200 hover:border-blue-400",
    active: "border-blue-500 bg-blue-50",
    icon_bg: "bg-blue-100 text-blue-600",
  },
  {
    id: "handyman",
    icon: Wrench,
    label: "Handyman",
    desc: "I offer trade services",
    color: "border-amber-200 hover:border-amber-400",
    active: "border-amber-500 bg-amber-50",
    icon_bg: "bg-amber-100 text-amber-600",
  },
  {
    id: "employer",
    icon: Building2,
    label: "Employer",
    desc: "I want to hire talent",
    color: "border-lime-200 hover:border-lime-400",
    active: "border-lime-500 bg-lime-50",
    icon_bg: "bg-lime-100 text-lime-700",
  },
];

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/google`;
const LINKEDIN_AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/linkedin`;

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [step, setStep] = useState(1); // 1=role, 2=form
  const [role, setRole] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: "",
    skills: "",
    location: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectRole = (r) => {
    setRole(r);
    setStep(2);
    setError("");
  };

  // ── OAuth: redirect to backend — role will be asked on /oauth/select-role ──
  const handleOAuth = (provider) => {
    // For OAuth we DON'T pre-select a role here because the callback page
    // (/oauth/select-role) handles role selection after Google/LinkedIn authenticates.
    // This is intentional — OAuth users see the same role picker after auth.
    const url = provider === "google" ? GOOGLE_AUTH_URL : LINKEDIN_AUTH_URL;
    window.location.href = url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const payload = {
        role,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        ...(role === "handyman" && {
          skills: form.skills,
          location: form.location,
        }),
        ...(role === "employer" && {
          companyName: form.companyName,
          companyWebsite: form.companyWebsite,
        }),
      };

      const res = await axios.post(`${API}/api/auth/signup2`, payload, {
        withCredentials: true,
      });
      setUser(res.data.user);
      router.push(`/onboarding/${role}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-gray-900">
            Talent<span className="text-lime-600">HQ</span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? "Create your free account" : `Signing up as ${role}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          {/* ── STEP 1: Role selection ── */}
          {step === 1 && (
            <>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                I am a…
              </p>
              <div className="space-y-3 mb-6">
                {ROLES.map(
                  ({ id, icon: Icon, label, desc, color, active, icon_bg }) => (
                    <button
                      key={id}
                      onClick={() => selectRole(id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all bg-white ${role === id ? active : color}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${icon_bg}`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {label}
                        </p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="ml-auto text-gray-300 flex-shrink-0"
                      />
                    </button>
                  ),
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* OAuth buttons — role will be selected AFTER auth on /oauth/select-role */}
              <div className="space-y-3">
                <button
                  onClick={() => handleOAuth("google")}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path
                      fill="#4285F4"
                      d="M44.5 20H24v8.5h11.8C34.7 33.9 29.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.3 14.7l7 5.1C15.1 16 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.8 0-14.5 4.4-17.7 10.7z"
                      opacity=".8"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 46c5.4 0 10.3-1.8 14.1-4.8l-6.5-5.5C29.5 37.5 26.9 38 24 38c-5.1 0-9.5-3-11.7-7.4l-7 5.4C8.8 42.2 15.9 46 24 46z"
                      opacity=".8"
                    />
                    <path
                      fill="#EA4335"
                      d="M44.5 20H24v8.5h11.8c-.8 2.4-2.5 4.5-4.8 5.8l6.5 5.5C41.7 36.3 45 30.6 45 24c0-1.3-.2-2.7-.5-4z"
                      opacity=".8"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => handleOAuth("linkedin")}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="6" fill="#0077B5" />
                    <path
                      d="M12 18h6v18h-6zM15 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 18h5.5v2.5h.1c.8-1.5 2.7-3 5.5-3C39 17.5 40 21 40 25v11h-6v-10c0-2.5-.1-5.5-3.5-5.5-3.5 0-4 2.7-4 5.5V36h-6V18z"
                      fill="white"
                    />
                  </svg>
                  Continue with LinkedIn
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-5">
                When you continue with Google or LinkedIn, you'll be asked to
                choose your role after signing in.
              </p>
            </>
          )}

          {/* ── STEP 2: Registration form ── */}
          {step === 2 && (
            <>
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-4">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Ada Okonkwo"
                    required
                    className={INP}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                    required
                    className={INP}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className={`${INP} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {role === "handyman" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Trade / Skills
                      </label>
                      <input
                        value={form.skills}
                        onChange={(e) => set("skills", e.target.value)}
                        placeholder="e.g. Plumbing, Electrical, Carpentry"
                        className={INP}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Location
                      </label>
                      <input
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="e.g. Lagos"
                        className={INP}
                      />
                    </div>
                  </>
                )}

                {role === "employer" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Company Name
                      </label>
                      <input
                        value={form.companyName}
                        onChange={(e) => set("companyName", e.target.value)}
                        placeholder="Acme Nigeria Ltd"
                        className={INP}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={form.companyWebsite}
                        onChange={(e) => set("companyWebsite", e.target.value)}
                        placeholder="https://yourcompany.com"
                        className={INP}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition w-full text-center"
              >
                ← Change role
              </button>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
