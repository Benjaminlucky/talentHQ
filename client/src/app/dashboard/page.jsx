"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
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
  }, [router]);

  return <p>Redirecting to your dashboard...</p>;
}
