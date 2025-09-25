"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingButton({
  onClick,
  children,
  className = "",
  loadingText = "Loading...",
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset loading after route changes
  useEffect(() => {
    const handleRouteChange = () => setLoading(false);

    router.events?.on("routeChangeComplete", handleRouteChange);
    router.events?.on("routeChangeError", handleRouteChange);

    return () => {
      router.events?.off("routeChangeComplete", handleRouteChange);
      router.events?.off("routeChangeError", handleRouteChange);
    };
  }, [router]);

  const handleClick = async (e) => {
    setLoading(true);
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
