"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Always show success to prevent email enumeration
      await fetch(`${API}/api/superadmin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      // Still show success — never reveal if email exists
      setSent(true);
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
            Locked out?
            <br />
            We'll get you
            <br />
            <span className="text-lime-400">back in safely.</span>
          </h2>
          <p className="text-green-300/50 text-sm leading-relaxed max-w-xs">
            Enter your admin email and we'll send a secure reset link. Links
            expire after 30 minutes.
          </p>
          <div className="px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-green-300/60 text-xs font-semibold mb-1">
              Security note
            </p>
            <p className="text-green-300/40 text-[11px] leading-relaxed">
              For security, we always show a success message regardless of
              whether the email exists in our system.
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

          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-7 transition"
          >
            <ArrowLeft size={14} /> Back to login
          </Link>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={30} className="text-lime-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">
                  Check your email
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If <strong className="text-gray-700">{email}</strong> is
                  associated with an admin account, you'll receive a password
                  reset link shortly.
                </p>
              </div>
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <p className="text-xs font-semibold text-amber-800 mb-0.5">
                  Didn't receive it?
                </p>
                <p className="text-[11px] text-amber-600 leading-relaxed">
                  Check your spam folder. Reset links expire after 30 minutes.
                  If you still can't access your account, contact your system
                  administrator.
                </p>
              </div>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                Reset password
              </h1>
              <p className="text-sm text-gray-500 mb-7">
                Enter your admin email and we'll send you a reset link.
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
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@talenthq.ng"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder:text-gray-300 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>Send reset link</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
