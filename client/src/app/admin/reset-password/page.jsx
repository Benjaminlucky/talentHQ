"use client";
export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

function StrengthBar({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ].filter(Boolean).length;
  const colors = [
    "",
    "bg-red-500",
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-500",
    "bg-green-500",
  ];
  return (
    <div className="flex gap-1 mt-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full ${i <= score ? colors[score] : "bg-gray-200"} transition-all`}
        />
      ))}
    </div>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle size={24} className="text-red-500" />
        </div>
        <p className="font-bold text-gray-900">Invalid reset link</p>
        <p className="text-sm text-gray-500">
          This link is missing a reset token.
        </p>
        <Link
          href="/admin/forgot-password"
          className="text-primary-600 font-semibold hover:underline text-sm"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/superadmin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} className="text-lime-600" />
        </div>
        <div>
          <p className="font-black text-gray-900 text-lg">Password updated!</p>
          <p className="text-sm text-gray-500 mt-1">
            Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-black text-gray-900 mb-1">
        Set new password
      </h1>
      <p className="text-sm text-gray-500 mb-7">
        Choose a strong password for your admin account
      </p>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-5">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
            New password
          </label>
          <div className="relative">
            <Lock
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className="w-full pl-10 pr-11 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 transition"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password && <StrengthBar password={password} />}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
            Confirm password
          </label>
          <div className="relative">
            <Lock
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              className="w-full pl-10 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 transition"
            />
          </div>
          {confirm && password !== confirm && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={10} />
              Passwords do not match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20 mt-1"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Updating…
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </>
  );
}

export default function AdminResetPassword() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #003017 0%, #001a0d 60%, #00120a 100%)",
        }}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full border border-white/5 translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-green-950" />
            </div>
            <span className="text-white font-black text-xl">TalentHQ</span>
          </div>
          <p className="text-lime-400/50 text-[10px] font-bold uppercase tracking-widest">
            Super Admin Portal
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-black text-white leading-snug">
            Almost there.
            <br />
            Set a strong
            <br />
            <span className="text-lime-400">new password.</span>
          </h2>
          <p className="text-green-300/50 text-sm leading-relaxed max-w-xs">
            Your reset link is valid for 30 minutes. After resetting, all
            existing sessions will be invalidated.
          </p>
        </div>
        <p className="relative z-10 text-green-500/25 text-xs">
          © {new Date().getFullYear()} TalentHQ
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={15} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm">
              TalentHQ Admin
            </span>
          </div>
          <Suspense
            fallback={
              <div className="h-40 animate-pulse bg-gray-100 rounded-2xl" />
            }
          >
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
