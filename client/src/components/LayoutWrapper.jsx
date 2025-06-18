"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/dashboard");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
