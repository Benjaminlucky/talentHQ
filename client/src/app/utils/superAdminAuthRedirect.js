"use client";
// app/utils/superAdminAuthRedirect.js
//
// Super admin auth uses a separate localStorage Bearer token system
// (not the httpOnly JWT cookie used by regular users).
// This is intentional — admins log in via /admin/login which stores
// "superadminToken" in localStorage via the /api/superadmin/login endpoint.
//
// Usage (unchanged from before):
//   const isAuthorized = useSuperAdminAuthRedirect();
//   if (!isAuthorized) return <Spinner />;
//
// Returns: false (checking/unauthorized) | true (authorized)
// NOTE: returns a boolean — not a string — because all consuming pages
// do  `if (!isAuthorized) return ...`

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE;

export const useSuperAdminAuthRedirect = () => {
  const router = useRouter();
  // false = still checking OR unauthorized; true = verified authorized
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verify = async () => {
      // ── Step 1: fast localStorage pre-check ────────────────────────────
      const token = localStorage.getItem("superadminToken");
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      // ── Step 2: server-side verification (the real gate) ───────────────
      try {
        const res = await fetch(`${API}/api/superadmin/verify`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          // Token is valid — allow access
          setIsAuthorized(true);
          return;
        }

        // Token rejected — clear stale data and redirect
        localStorage.removeItem("superadminToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.replace("/admin/login");
      } catch {
        // ── Step 3: network error fallback ─────────────────────────────
        // If the verify request fails (Railway cold start, network blip)
        // fall back to checking the stored user role. This prevents
        // admins from being locked out during brief outages.
        try {
          const raw = localStorage.getItem("user");
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed?.role === "superadmin") {
            setIsAuthorized(true);
          } else {
            router.replace("/admin/login");
          }
        } catch {
          router.replace("/admin/login");
        }
      }
    };

    verify();
  }, [router]);

  return isAuthorized;
};
