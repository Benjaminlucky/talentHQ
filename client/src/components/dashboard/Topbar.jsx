"use client";
import { useState, useEffect } from "react";

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      {user && (
        <div className="flex items-center gap-3">
          <span className="font-medium">{user.fullName}</span>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="text-sm text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
