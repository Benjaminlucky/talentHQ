"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const employerAuthRedirect = (allowedRole) => {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // ✅ track state

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.push("/employer-signin");
      setStatus("unauthorized");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const role = user?.role;

      if (allowedRole && role !== allowedRole) {
        router.push("/employer-signin");
        setStatus("unauthorized");
      } else {
        setStatus("authorized");
      }
    } catch (err) {
      console.error("Failed to parse user data", err);
      router.push("/employer-signin");
      setStatus("unauthorized");
    }
  }, [allowedRole, router]);

  return status; // ✅ return status to consuming component
};

export default employerAuthRedirect;
