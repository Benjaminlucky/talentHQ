"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { superAdminMenu } from "../../../data";

export default function SuperAdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const pathname = usePathname();

  const toggleDropdown = (menuTitle) => {
    setActiveDropdown((prev) => (prev === menuTitle ? "" : menuTitle));
  };

  const logoutSuperAdmin = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await fetch("/api/superadmin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      localStorage.clear();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Sidebar */}
      <div
        className={`${
          isOpen
            ? "absolute top-0 left-0 z-50 w-64"
            : "hidden md:flex md:flex-col w-64"
        } bg-lime-600 text-white h-full transition-all duration-300 justify-between`}
      >
        <div>
          <div className="flex justify-between items-center p-4 border-b border-lime-500">
            <h1 className="font-bold text-xl">Super Admin</h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden">
              <FiX size={20} />
            </button>
          </div>

          <ul className="p-4 space-y-2">
            {superAdminMenu.map((item, index) => {
              // Check if item or any child is active
              const isTopLevelActive = item.path && pathname === item.path;

              const isDropdownChildActive = item.children?.some(
                (child) => pathname === child.path
              );

              const isActive = isTopLevelActive || isDropdownChildActive;

              return (
                <li key={index}>
                  {item.type === "link" || item.path ? (
                    <Link
                      href={item.path}
                      className={`flex items-center py-2 px-3 rounded transition-all duration-150 ${
                        isActive
                          ? "bg-lime-700 font-semibold"
                          : "hover:bg-lime-500"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.title)}
                        className={`flex items-center w-full py-2 px-3 rounded transition-all duration-150 ${
                          isDropdownChildActive
                            ? "bg-lime-700 font-semibold"
                            : "hover:bg-lime-500"
                        }`}
                      >
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </button>

                      <ul
                        className={`pl-3 mt-1 transition-all duration-300 ease-in-out overflow-hidden ${
                          activeDropdown === item.title
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {item.children?.map((child, idx) => {
                          const isChildActive = pathname === child.path;

                          return (
                            <li key={idx}>
                              <Link
                                href={child.path}
                                className={`block py-2 px-3 rounded-sm transition-all duration-150 ${
                                  isChildActive
                                    ? "bg-lime-700 font-semibold"
                                    : "hover:bg-lime-500"
                                }`}
                              >
                                {child.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-lime-500">
          <button
            onClick={logoutSuperAdmin}
            className="flex items-center text-left py-2 px-3 w-full hover:bg-lime-500 rounded"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 min-h-screen">
        <div className="md:hidden mb-4">
          <button onClick={() => setIsOpen(true)} className="text-lime-600">
            <FiMenu size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
