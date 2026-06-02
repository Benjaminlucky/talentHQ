"use client";
// app/dashboard/layout.jsx
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const encoded = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${encoded}`);
    }
  }, [user, loading, router, pathname]);

  // ── Spinner while /api/auth/me is resolving ───────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-primary-500" />
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated — return null while redirect fires ──────────────────
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <span className="font-bold text-lg text-gray-900">
            Talent<span className="text-lime-600">HQ</span>
          </span>
        </div>

        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
