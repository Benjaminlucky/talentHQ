"use client";
// app/utils/employerAuthRedirect.js
//
// Drop-in replacement for the old localStorage-based hook.
// Uses AuthContext (httpOnly JWT cookie) instead of localStorage so it
// works with the current auth system.
//
// Usage (unchanged from before):
//   const status = useEmployerAuthRedirect("employer");
//   if (status !== "authorized") return null; // or a spinner
//
// Returns: "checking" | "authorized" | "unauthorized"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const useEmployerAuthRedirect = (allowedRole = "employer") => {
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
      // Send the user to their actual dashboard rather than a 404/error page
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

export default useEmployerAuthRedirect;
