// src/components/LoadingSpinner.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LoadingSpinner({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Trigger spinner on route change
  useEffect(() => {
    setLoading(true);

    // Fake small delay so the spinner is visible during fast loads
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {children}
    </div>
  );
}
