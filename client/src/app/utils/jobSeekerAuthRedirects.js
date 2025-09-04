"use client";

import { useEffect, useState } from "react";

export function jobSeekerAuthRedirect(allowedRole = "jobseeker") {
  const [status, setStatus] = useState("loading");
  // status can be: "loading" | "authorized" | "unauthorized"

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("jobSeeker");
      if (!storedUser) {
        setStatus("unauthorized");
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(storedUser);

      // normalize roles (in case backend sends JobSeeker, jobseeker, etc.)
      const userRole = user.role?.toLowerCase();
      const expectedRole = allowedRole.toLowerCase();

      if (userRole === expectedRole) {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setStatus("unauthorized");
      window.location.href = "/login";
    }
  }, [allowedRole]);

  return status;
}
