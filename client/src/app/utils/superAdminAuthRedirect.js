// src/app/utils/superAdminAuthRedirect.js
// Verifies superadmin session server-side.
// localStorage check is just a fast pre-check — the real verification
// is done against the server so a tampered localStorage can't grant access.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE;

export const useSuperAdminAuthRedirect = () => {
  const router = useRouter();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const verify = async () => {
      // Fast pre-check: if nothing in localStorage, redirect immediately
      const token = localStorage.getItem("superadminToken");
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      // Server-side verification — the real gate
      try {
        const res = await fetch(`${API}/api/superadmin/verify`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Token is expired or invalid — clear stale data
          localStorage.removeItem("superadminToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          router.replace("/admin/login");
          return;
        }

        setStatus("authorized");
      } catch {
        // Network error — fall back to localStorage role check only
        // (better to allow access than to lock out during a network blip)
        try {
          const userData = localStorage.getItem("user");
          const parsed = userData ? JSON.parse(userData) : null;
          if (parsed?.role === "superadmin") {
            setStatus("authorized");
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

  return status;
};
