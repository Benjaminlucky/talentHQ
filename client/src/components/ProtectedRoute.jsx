"use client";
// src/components/ProtectedRoute.jsx
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute
 * Props:
 *   children     — page content to render when authorized
 *   allowedRoles — string[] of roles that may access this page
 *                  e.g. ["employer"] or ["jobseeker", "handyman"]
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in → send to login with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.replace(`/login?redirect=${returnUrl}`);
      return;
    }

    // Logged in but wrong role → redirect to their own dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dashMap = {
        jobseeker: "/dashboard/jobseeker",
        handyman: "/dashboard/handyman",
        employer: "/dashboard/employer",
      };
      router.replace(dashMap[user.role] || "/");
    }
  }, [user, loading, router, allowedRoles]);

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-primary-500" />
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // Not yet redirected — render nothing to avoid flash
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
