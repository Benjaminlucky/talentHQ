"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { employerDashNav } from "../../data";

function EmployerDashboardSidebar() {
  const pathname = usePathname();

  const logoutEmployer = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await fetch("/api/employers/logout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Optional: Redirect to login
      window.location.href = "/employer-signin";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="flex flex-col space-y-2 w-full">
      {employerDashNav.map((menu, index) => (
        <li key={index} className="list-none">
          {menu.item === "Log Out" ? (
            <button
              onClick={logoutEmployer}
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

export default EmployerDashboardSidebar;
