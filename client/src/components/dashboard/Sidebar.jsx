"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar({ pathname }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Example: read role from localStorage or API
    const user = JSON.parse(localStorage.getItem("user"));
    setRole(user?.role || "jobseeker");
  }, []);

  const navItems = {
    jobseeker: [
      { href: "/dashboard/jobseeker", label: "Overview" },
      { href: "/dashboard/jobseeker/applications", label: "Applications" },
    ],
    handyman: [
      { href: "/dashboard/handyman", label: "Overview" },
      { href: "/dashboard/handyman/jobs", label: "Jobs" },
    ],
    employer: [
      { href: "/dashboard/employer", label: "Overview" },
      { href: "/dashboard/employer/post-job", label: "Post a Job" },
    ],
    admin: [
      { href: "/dashboard/admin", label: "Overview" },
      { href: "/dashboard/admin/users", label: "Manage Users" },
    ],
  };

  return (
    <aside className="w-64 bg-white border-r shadow-md p-4">
      <h2 className="text-xl font-bold mb-6">TalentHQ</h2>
      <nav className="space-y-2">
        {role &&
          navItems[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md ${
                pathname === item.href
                  ? "bg-lime-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
