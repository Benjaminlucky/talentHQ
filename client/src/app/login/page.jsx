"use client";
// src/app/login/page.jsx
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;
const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/google`;
const LINKEDIN_AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/linkedin`;

const ROLE_DASH = {
  jobseeker: "/dashboard/jobseeker",
  handyman: "/dashboard/handyman",
  employer: "/dashboard/employer",
};

const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show OAuth error messages from callback redirects
  const oauthError = searchParams.get("error");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/login`, form, {
        withCredentials: true,
      });
      const user = res.data.user;
      setUser(user);
      const returnUrl = searchParams.get("redirect");
      router.push(returnUrl || ROLE_DASH[user.role] || "/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href =
      provider === "google" ? GOOGLE_AUTH_URL : LINKEDIN_AUTH_URL;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-gray-900">
            Talent<span className="text-lime-600">HQ</span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* OAuth error */}
          {oauthError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl mb-5">
              <AlertCircle size={14} className="flex-shrink-0" />
              Social sign-in failed. Please try again or use email below.
            </div>
          )}

          {/* Email error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-5">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3 mb-5">
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

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="email"
                className={INP}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-600 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
