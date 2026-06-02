"use client";
// app/utils/jobSeekerAuthRedirects.js
//
// Drop-in replacement for the old localStorage-based hook.
// Uses AuthContext (httpOnly JWT cookie) instead of localStorage so it
// works with the current auth system.
//
// Usage (unchanged from before):
//   const status = useJobSeekerAuthRedirect();
//   const status = useJobSeekerAuthRedirect("jobseeker");
//
// Returns: "loading" | "authorized" | "unauthorized"
// (kept "loading" as the initial value to match the original API)

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useJobSeekerAuthRedirect(allowedRole = "jobseeker") {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Use "loading" as initial value to match the original hook's API
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // Still waiting for /api/auth/me
    if (loading) return;

    if (!user) {
      setStatus("unauthorized");
      const encoded = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${encoded}`);
      return;
    }

    // Normalize role comparison (original hook did .toLowerCase())
    const userRole = user.role?.toLowerCase();
    const expectedRole = allowedRole.toLowerCase();

    if (userRole !== expectedRole) {
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
}
