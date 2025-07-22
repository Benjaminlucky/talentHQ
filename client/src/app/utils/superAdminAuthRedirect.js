"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useSuperAdminAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "superadmin") {
        router.push("/admin/login");
      }
    } catch (error) {
      localStorage.removeItem("user");
      router.push("/admin/login");
    }
  }, [router]);
};
