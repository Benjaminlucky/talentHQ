"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function SuperAdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/superadmin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");
      localStorage.setItem("superadminToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.superadmin));
      router.push("/dashboard-admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full border border-white/5 translate-x-1/3 translate-y-1/3" />
        <div className="absolute bottom-24 right-12 w-24 h-24 rounded-full bg-lime-500/8" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-green-950" />
            </div>
            <span className="text-white font-black text-xl">TalentHQ</span>
          </div>
          <p className="text-lime-400/50 text-[10px] font-bold uppercase tracking-widest ml-13">
            Super Admin Portal
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <h2 className="text-3xl font-black text-white leading-snug">
            Full platform
            <br />
            control, one
            <br />
            <span className="text-lime-400">secure login.</span>
          </h2>
          <p className="text-green-300/50 text-sm leading-relaxed max-w-xs">
            Manage users, moderate content, post jobs, and monitor platform
            health from a single dashboard.
          </p>
          <div className="space-y-2">
            {[
              "User management & verification",
              "Content moderation tools",
              "Platform analytics & reports",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2.5 text-xs text-green-400/50 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-green-500/25 text-xs">
          © {new Date().getFullYear()} TalentHQ · Authorised access only
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

          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-7">
            Sign in to your admin account
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
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="admin@talenthq.ng"
                required
                autoComplete="email"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
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
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 pr-11 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to dashboard <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Need admin access?{" "}
              <Link
                href="/admin/signup"
                className="text-primary-600 font-semibold hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
