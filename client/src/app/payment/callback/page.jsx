"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

function CallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const type = searchParams.get("type") || "subscription";
  const userRole = searchParams.get("userRole");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [retrying, setRetrying] = useState(false);

  const verify = async () => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found in URL.");
      return;
    }
    try {
      const res = await axios.get(`${API}/api/payments/verify/${reference}`, {
        withCredentials: true,
      });
      setStatus("success");
      setMessage(
        `Payment of ₦${res.data.amountPaid?.toLocaleString() || ""} confirmed.`,
      );
    } catch (err) {
      setStatus("failed");
      setMessage(
        err.response?.data?.message ||
          "Verification failed. Contact support if you were charged.",
      );
    }
  };

  useEffect(() => {
    verify();
  }, []); // eslint-disable-line

  const handleRetry = async () => {
    setRetrying(true);
    setStatus("loading");
    await verify();
    setRetrying(false);
  };

  const getRedirect = () => {
    if (type === "boost") return "/dashboard/employer/my-jobs";
    if (type === "ad") return "/post-advert";
    if (type === "subscription") {
      if (userRole === "jobseeker") return "/dashboard/jobseeker/upgrade";
      return "/dashboard/employer/billing";
    }
    return "/dashboard";
  };

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
              href={getRedirect()}
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
              <p className="font-black text-gray-900 text-xl">
                Verification Failed
              </p>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <p className="text-xs text-gray-400">
              Reference:{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                {reference || "none"}
              </code>
            </p>
            <div className="flex flex-col gap-3">
              {reference && (
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                >
                  <RefreshCw
                    size={14}
                    className={retrying ? "animate-spin" : ""}
                  />
                  Retry verification
                </button>
              )}
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
            </div>
            <p className="text-xs text-gray-400">
              If you were charged, contact support with your reference.
            </p>
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
