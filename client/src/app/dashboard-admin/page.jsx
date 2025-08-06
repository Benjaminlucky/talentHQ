"use client";

import { useSuperAdminAuthRedirect } from "../utils/superAdminAuthRedirect";

export default function AdminDashboardPage() {
  const isAuthorized = useSuperAdminAuthRedirect();

  if (!isAuthorized) return null; // 👈 Prevent unauthorized flash

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Welcome, Super Admin</h1>
      {/* Your dashboard UI */}
    </div>
  );
}
