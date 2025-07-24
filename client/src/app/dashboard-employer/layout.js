"use client";

import EmployerDashboardSidebar from "@/components/EmployerDashboardSidebar";
import { useEffect, useState } from "react";

import { FiMenu } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

import employerAuthRedirect from "../utils/employerAuthRedirect.js";

export default function DashboardLayout({ children }) {
  employerAuthRedirect("employer");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const prevColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f0f0f0";
    return () => {
      document.body.style.backgroundColor = prevColor;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full relative">
      {/* Mobile Menu Button */}
      <button
        className="absolute top-4 left-4 z-30 md:hidden text-2xl text-gray-700"
        onClick={() => setSidebarOpen(true)}
      >
        <FiMenu />
      </button>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block md:w-74 bg-white shadow-md p-4 border-r border-gray-200">
        <EmployerDashboardSidebar />
      </aside>

      {/* Sidebar - Mobile (Drawer) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-lime-200 opacity-20 z-20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-4 z-30 animate-slide-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
              <button
                className="text-gray-600 text-xl"
                onClick={() => setSidebarOpen(false)}
              >
                <IoMdClose />
              </button>
            </div>
            <EmployerDashboardSidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 mt-8 md:mt-0 p-4 md:p-6 w-full z-10">
        {children}
      </main>
    </div>
  );
}
