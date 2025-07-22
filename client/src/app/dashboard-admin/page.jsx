"use client";
import { useSuperAdminAuthRedirect } from "../utils/superAdminAuthRedirect.js";

export default function AdminDashboardHome() {
  useSuperAdminAuthRedirect(); // 🔐 Protect this page
  return (
    <div>
      <h1 className="text-3xl font-bold text-lime-700 mb-4">
        Super Admin Dashboard
      </h1>
      <p>
        Welcome back! Use the sidebar to manage users, handle reports, and post
        announcements.
      </p>
    </div>
  );
}
