"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import clsx from "clsx"; // Optional: for clean conditional class names
import { jobseekerDashNav } from "../../data";

function JobSeekerdashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {jobseekerDashNav.map(({ item, icon: Icon, link }) => (
        <Link
          key={item}
          href={link}
          className={clsx(
            "flex items-center gap-3 mb-3 px-4 py-3 rounded-md text-gray-700 hover:bg-lime-200 transition",
            {
              "bg-lime-200 font-medium text-blue-600": pathname === link,
            }
          )}
        >
          <Icon className="text-lg text-primary-500" />
          <span className="text-primary-500 font-semibold">{item}</span>
        </Link>
      ))}
    </nav>
  );
}

export default JobSeekerdashboardSidebar;
