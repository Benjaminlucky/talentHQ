"use client";
// components/ProtectedRoute.jsx
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute
 *
 * Props:
 *   children      — page content to render when authorized
 *   allowedRoles  — string[] of roles permitted, e.g. ["employer"]
 *                   omit to allow any authenticated user
 *
 * Behaviour:
 *   • While auth is loading  → full-screen spinner (no flash, no redirect)
 *   • Not logged in          → replace to /login?redirect=<current path>
 *   • Wrong role             → replace to the user's own dashboard
 *   • Authorized             → render children
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // wait for /api/auth/me to respond

    if (!user) {
      // Not logged in — send to login with the current path as ?redirect=
      const encoded = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${encoded}`);
      return;
    }

    // Logged in but accessing a page their role can't see
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dashMap = {
        jobseeker: "/dashboard/jobseeker",
        handyman: "/dashboard/handyman",
        employer: "/dashboard/employer",
      };
      router.replace(dashMap[user.role] || "/");
    }
  }, [user, loading, router, allowedRoles, pathname]);

  // ── Still fetching /api/auth/me ───────────────────────────────────────────
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

  // ── Not logged in or wrong role — return null while redirect fires ─────────
  // Avoids a flash of protected content before router.replace resolves
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
