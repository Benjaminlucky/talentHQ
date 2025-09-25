// src/app/dashboard/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    switch (user.role) {
      case "jobseeker":
        router.push("/dashboard/jobseeker");
        break;
      case "handyman":
        router.push("/dashboard/handyman");
        break;
      case "employer":
        router.push("/dashboard/employer");
        break;
      case "admin":
        router.push("/dashboard/admin");
        break;
      default:
        router.push("/login");
    }
  }, [user, loading, router]);

  return <p>Redirecting to your dashboard...</p>;
}
