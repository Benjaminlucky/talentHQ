"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { handymanDashNav } from "../../data";

function HandymanDashboardSidebar() {
  const pathname = usePathname();

  const logoutHandyman = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await fetch("/api/handyman/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("jobSeeker");

      // Optional: Redirect to login
      window.location.href = "/handyman-signin";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="flex flex-col space-y-2 w-full">
      {handymanDashNav.map((menu, index) => (
        <li key={index} className="list-none">
          {menu.item === "Log Out" ? (
            <button
              onClick={logoutHandyman}
              className="flex bg-red-200 items-center  gap-2 w-full text-left text-red-600 hover:bg-red-300 px-4 py-2 rounded"
            >
              <menu.icon />
              {menu.item}
            </button>
          ) : (
            <Link
              href={menu.link}
              className={`flex items-center gap-2 px-4 py-2 rounded hover:text-white hover:bg-lime-500 ${
                pathname === menu.link
                  ? "bg-lime-500 text-white font-semibold"
                  : ""
              }`}
            >
              <menu.icon />
              {menu.item}
            </Link>
          )}
        </li>
      ))}
    </nav>
  );
}

export default HandymanDashboardSidebar;
