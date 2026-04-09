"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

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
      disabled={loading}
      onClick={() => {
        setLoading(true);
        onClick();
        setTimeout(() => setLoading(false), 8000);
      }}
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

// ── Inner component — uses useSearchParams so must live inside <Suspense> ────
function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("error");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const messages = {
        google_failed: "Google sign-in failed. Please try again.",
        linkedin_failed: "LinkedIn sign-in failed. Please try again.",
        oauth_failed: "Social sign-in failed. Please try again.",
      };
      setMessageType("error");
      setMessage(messages[error] || "Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API}/api/auth/login`, formData, {
        withCredentials: true,
      });
      const user = res.data.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      setMessageType("success");
      setMessage("Login successful! Redirecting…");
      setTimeout(() => {
        const routes = {
          jobseeker: "/dashboard/jobseeker",
          handyman: "/dashboard/handyman",
          employer: "/dashboard/employer",
        };
        router.push(routes[user.role] || "/dashboard");
      }, 500);
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${API}/api/auth/${provider}`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/">
          <span className="text-2xl font-black text-gray-900">
            Talent<span className="text-lime-600">HQ</span>
          </span>
        </Link>
        <h1 className="text-2xl font-black text-gray-900 mt-4 mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">Log in to your account</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {message && (
          <div
            className={`mb-5 px-4 py-3 text-sm rounded-xl border ${messageType === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-lime-50 text-lime-700 border-lime-200"}`}
          >
            {message}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <OAuthButton
            label="Continue with Google"
            icon={GoogleIcon}
            onClick={() => handleOAuth("google")}
          />
          <OAuthButton
            label="Continue with LinkedIn"
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
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-lime-700 font-semibold hover:text-lime-800"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Logging in…
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-lime-700 font-semibold hover:text-lime-800"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page export — Suspense required by Next.js 15 for useSearchParams ─────────
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
            <Loader2 size={28} className="animate-spin text-lime-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
