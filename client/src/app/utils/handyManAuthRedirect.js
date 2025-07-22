// app/utils/useAuthRedirect.js
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const handyManAuthRedirect = (allowedRole) => {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.push("/handyman-signin"); // or your login page
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== allowedRole) {
        router.push("/unauthorized"); // or a generic fallback route
      }
    } catch (err) {
      router.push("/handyman-signin");
    }
  }, [allowedRole, router]);
};

export default handyManAuthRedirect;
