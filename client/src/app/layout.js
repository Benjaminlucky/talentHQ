// src/app/layout.js
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }) {
  const pathname = usePathname(); // ✅ correct hook usage

  const isDashboard = pathname.startsWith("/dashboard");
  const hideNavbar = isDashboard;

  return (
    <>
      {/* Navbar is hidden only on dashboard pages */}
      {!hideNavbar && <Navbar />}

      <main
        className={
          isDashboard
            ? "w-full px-0 py-0 bg-white"
            : "max-w-7xl mx-auto px-4 py-6"
        }
      >
        {/* ✅ Wrap with loading spinner */}
        <LoadingSpinner>{children}</LoadingSpinner>
      </main>
    </>
  );
}
