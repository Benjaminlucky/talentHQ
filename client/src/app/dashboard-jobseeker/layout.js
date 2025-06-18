"use client";

import { useEffect } from "react";
import JobSeekerdashboardSidebar from "@/components/JobSeekerdashboardSidebar";

export default function DashboardLayout({ children }) {
  useEffect(() => {
    const prevColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f0f0f0";
    return () => {
      document.body.style.backgroundColor = prevColor;
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md rounded-sm p-4 hidden md:block">
        <JobSeekerdashboardSidebar />
      </aside>

      {/* Dynamic Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
