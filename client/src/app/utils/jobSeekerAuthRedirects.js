// utils/useAuthRedirect.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function jobSeekerAuthRedirect(allowedRole) {
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user =
      JSON.parse(localStorage.getItem("jobSeeker")) ||
      JSON.parse(localStorage.getItem("user"));

    if (!accessToken || !user || user.role !== allowedRole) {
      router.replace("/jobseeker-signin");
    }
  }, [allowedRole, router]);
}
