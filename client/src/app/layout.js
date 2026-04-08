// src/app/layout.js
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import Providers from "./providers";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dashboard-admin") ||
    pathname.startsWith("/dashboard-employer") ||
    pathname.startsWith("/dashboard-handyman") ||
    pathname.startsWith("/dashboard-jobseeker");

  if (isDashboard) {
    // Dashboard pages: no navbar, no footer, no padding — each dashboard
    // handles its own layout (sidebar + content area)
    return <>{children}</>;
  }

  // Public pages: navbar on top, footer at bottom.
  // NOTE: <main> has NO max-width or padding here — each page is responsible
  // for its own inner container (max-w-7xl mx-auto px-4) so full-bleed
  // sections like hero banners and footers can stretch edge-to-edge.
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full">
        <LoadingSpinner>{children}</LoadingSpinner>
      </main>
      <Footer />
    </div>
  );
}
