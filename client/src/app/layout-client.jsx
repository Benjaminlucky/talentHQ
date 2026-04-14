"use client";
// src/app/layout-client.jsx
// This is the client shell extracted from layout.js so that layout.js can be
// a server component (required for Next.js metadata API to work).

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Providers from "./providers";

export default function LayoutClient({ children }) {
  return (
    <Providers>
      <LayoutWrapper>{children}</LayoutWrapper>
    </Providers>
  );
}

function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/dashboard-admin");
  const isAdminAuth = pathname?.startsWith("/admin/");
  const hideNavbar = isDashboard || isAdminAuth;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main
        className={
          isDashboard
            ? "w-full px-0 py-0 bg-white"
            : "max-w-7xl mx-auto px-4 py-6"
        }
      >
        {isDashboard ? children : <LoadingSpinner>{children}</LoadingSpinner>}
      </main>
    </>
  );
}
