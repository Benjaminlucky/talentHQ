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
  CheckCircle2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

function StrengthBar({ password }) {
  const checks = {
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    num: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ["", "Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "bg-red-500",
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-500",
    "bg-green-500",
  ];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`}
          />
        ))}
        <span
          className={`text-[10px] font-bold ml-1.5 w-10 flex-shrink-0 ${score <= 2 ? "text-red-500" : score <= 3 ? "text-amber-500" : "text-green-600"}`}
        >
          {labels[score]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {[
          ["8+ chars", checks.len],
          ["Uppercase", checks.upper],
          ["Lowercase", checks.lower],
          ["Number", checks.num],
          ["Symbol", checks.special],
        ].map(([l, v]) => (
          <span
            key={l}
            className={`text-[11px] flex items-center gap-0.5 ${v ? "text-green-600" : "text-gray-400"}`}
          >
            {v ? "✓" : "○"} {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/superadmin/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2000);
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

        <div className="relative z-10 space-y-5">
          <h2 className="text-3xl font-black text-white leading-snug">
            Join the team
            <br />
            running Nigeria's
            <br />
            <span className="text-lime-400">talent platform.</span>
          </h2>
          <p className="text-green-300/50 text-sm leading-relaxed max-w-xs">
            Create your super admin account to access platform controls, user
            management, and moderation tools.
          </p>
          <div className="px-4 py-3.5 bg-amber-500/10 border border-amber-400/20 rounded-xl">
            <p className="text-amber-300/80 text-xs font-semibold">
              ⚠️ Restricted access
            </p>
            <p className="text-amber-200/50 text-[11px] mt-0.5 leading-relaxed">
              Admin accounts require authorisation. Unauthorised signup attempts
              are logged.
            </p>
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
            Create admin account
          </h1>
          <p className="text-sm text-gray-500 mb-7">
            Fill in your details below
          </p>

          {success ? (
            <div className="flex flex-col items-center text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-lime-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} className="text-lime-600" />
              </div>
              <p className="font-black text-gray-900">Account created!</p>
              <p className="text-sm text-gray-500">Redirecting to login…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-5">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Full name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 transition"
                  />
                </div>

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
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Create a strong password"
                      required
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
                  {form.password && <StrengthBar password={form.password} />}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20 mt-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/admin/login"
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
