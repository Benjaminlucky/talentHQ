"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Inner component — uses useSearchParams so must live inside <Suspense> ────
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  // Resend state (shown when no token in URL — user landed here without the link)
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "No verification token found. Please use the link sent to your email.",
      );
      return;
    }

    axios
      .get(`${API}/api/auth/verify-email`, { params: { token } })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may be invalid or expired.",
        );
      });
  }, [token]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendError("");
    try {
      await axios.post(
        `${API}/api/auth/resend-verification`,
        {},
        { withCredentials: true },
      );
      setResendSent(true);
    } catch (err) {
      setResendError(
        err.response?.data?.message ||
          "Could not send email. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
      {/* ── Loading ── */}
      {status === "loading" && (
        <>
          <Loader2
            size={40}
            className="animate-spin text-lime-600 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Verifying your email…
          </h1>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </>
      )}

      {/* ── Success ── */}
      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-lime-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Email Verified!
          </h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition"
          >
            Continue to Login
          </Link>
        </>
      )}

      {/* ── Error ── */}
      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Verification Failed
          </h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition"
            >
              Go to Login
            </Link>

            {/* Resend button — only show if user is logged in */}
            {user && !user.emailVerified && (
              <div className="mt-2">
                {resendSent ? (
                  <p className="text-sm text-lime-700 font-semibold">
                    ✓ New verification email sent — check your inbox.
                  </p>
                ) : (
                  <>
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-amber-300 text-amber-700 font-semibold text-sm rounded-xl hover:bg-amber-50 transition disabled:opacity-60"
                    >
                      {resendLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Mail size={14} />
                      )}
                      {resendLoading ? "Sending…" : "Resend Verification Email"}
                    </button>
                    {resendError && (
                      <p className="text-xs text-red-600 mt-2">{resendError}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page export — Suspense required by Next.js for useSearchParams ─────────
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full flex items-center justify-center min-h-[200px]">
            <Loader2 size={28} className="animate-spin text-lime-600" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
