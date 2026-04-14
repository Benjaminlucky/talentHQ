"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const type = searchParams.get("type") || "subscription";

  const [status, setStatus] = useState("loading"); // loading | success | failed
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }
    axios
      .get(`${API}/api/payments/verify/${reference}`, { withCredentials: true })
      .then((res) => {
        setStatus("success");
        setMessage(
          `Payment of ₦${res.data.amountPaid?.toLocaleString() || ""} confirmed successfully.`,
        );
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(
          err.response?.data?.message || "Payment verification failed.",
        );
      });
  }, [reference]);

  const REDIRECT = {
    subscription: "/dashboard/employer/billing",
    boost: "/dashboard/employer/my-jobs",
    ad: "/post-advert",
    jobseeker_premium: "/dashboard/jobseeker/upgrade",
  };
  const redirect = REDIRECT[type] || "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 w-full max-w-sm text-center space-y-5">
        {status === "loading" && (
          <>
            <Loader2
              size={36}
              className="animate-spin text-primary-500 mx-auto"
            />
            <p className="font-bold text-gray-900">Verifying payment…</p>
            <p className="text-sm text-gray-500">
              Please wait, do not close this page.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-lime-600" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-xl">
                Payment Successful!
              </p>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <p className="text-xs text-gray-400">
              Reference:{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                {reference}
              </code>
            </p>
            <Link
              href={redirect}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-sm transition"
            >
              Continue <ArrowRight size={14} />
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-red-500" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-xl">Payment Failed</p>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/pricing"
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition text-center"
              >
                Try again
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl text-sm hover:bg-gray-900 transition text-center"
              >
                Go home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
