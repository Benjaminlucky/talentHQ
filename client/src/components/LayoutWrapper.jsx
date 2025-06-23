"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const hideNavbar = isDashboard;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main
        className={
          isDashboard
            ? "w-full px-0 py-0 bg-white" // Full width layout for dashboard
            : "max-w-7xl mx-auto px-4 py-6" // Default layout for rest of the app
        }
      >
        {children}
      </main>
    </>
  );
}
