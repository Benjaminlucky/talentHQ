// utils/superAdminAuthRedirect.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useSuperAdminAuthRedirect = () => {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // "checking" | "authorized" | "unauthorized"

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.replace("/admin/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser?.role !== "superadmin") {
        router.replace("/admin/login");
      } else {
        setStatus("authorized");
      }
    } catch {
      localStorage.removeItem("user");
      router.replace("/admin/login");
    }
  }, [router]);

  return status;
};
