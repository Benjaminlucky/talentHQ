"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const employerAuthRedirect = (allowedRole) => {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.push("/employer-signin");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const role = user?.role;

      if (role !== allowedRole) {
        router.push("/employer-signin");
      }
    } catch (err) {
      console.error("Failed to parse user data", err);
      router.push("/employer-signin");
    }
  }, []);
};

export default employerAuthRedirect;
