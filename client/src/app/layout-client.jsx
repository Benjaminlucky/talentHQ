"use client";
// src/app/layout-client.jsx
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  const hideFooter = isDashboard || isAdminAuth;

  return (
    <>
      {!hideNavbar && <Navbar />}

      {isDashboard ? (
        // Dashboard: full width, sidebar handles all layout
        <main className="w-full px-0 py-0 bg-white">{children}</main>
      ) : (
        // Public pages: no constraining wrapper — each page controls its own width
        <LoadingSpinner>{children}</LoadingSpinner>
      )}

      {!hideFooter && <Footer />}
    </>
  );
}
