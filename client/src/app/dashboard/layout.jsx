"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;
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
          <h1 className="font-bold text-lg">TalentHQ</h1>
        </div>

        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
