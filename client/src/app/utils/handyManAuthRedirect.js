"use client";
// app/utils/handyManAuthRedirect.js
//
// Drop-in replacement for the old localStorage-based hook.
// Uses AuthContext (httpOnly JWT cookie) instead of localStorage so it
// works with the current auth system.
//
// Usage (unchanged from before):
//   useHandyManAuthRedirect("handyman");
//
// Returns: "checking" | "authorized" | "unauthorized"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const useHandyManAuthRedirect = (allowedRole = "handyman") => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    // Still waiting for /api/auth/me
    if (loading) return;

    if (!user) {
      setStatus("unauthorized");
      const encoded = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${encoded}`);
      return;
    }

    if (user.role !== allowedRole) {
      setStatus("unauthorized");
      const dashMap = {
        jobseeker: "/dashboard/jobseeker",
        handyman: "/dashboard/handyman",
        employer: "/dashboard/employer",
      };
      router.replace(dashMap[user.role] || "/");
      return;
    }

    setStatus("authorized");
  }, [user, loading, router, allowedRole, pathname]);

  return status;
};

export default useHandyManAuthRedirect;
