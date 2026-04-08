"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "No verification token found in the link. Please use the link sent to your email.",
      );
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/verify-email`, {
        params: { token },
      })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may be invalid or expired.",
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
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
              <p className="text-xs text-gray-400">
                Already logged in?{" "}
                <Link href="/dashboard" className="text-lime-700 underline">
                  Resend from your dashboard
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
