// src/app/layout.jsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Providers from "./providers"; // ✅ import your Providers wrapper
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Wrap everything with Providers (AuthProvider inside) */}
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const hideNavbar = isDashboard;

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
        {/* ✅ Spinner only for non-dashboard pages */}
        {isDashboard ? children : <LoadingSpinner>{children}</LoadingSpinner>}
      </main>
    </>
  );
}
