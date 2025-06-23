"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { jobseekerDashNav } from "../../data";

function JobSeekerdashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2 w-full">
      {jobseekerDashNav.map(({ item, icon: Icon, link }) => (
        <Link
          key={item}
          href={link}
          className={clsx(
            "flex items-center gap-3 px-3 py-3 rounded-md text-gray-700 hover:bg-lime-200 transition w-full",
            {
              "bg-lime-200 font-semibold text-lime-700": pathname === link,
            }
          )}
        >
          <Icon className="text-xl" />
          <span className="text-sm font-medium">{item}</span>
        </Link>
      ))}
    </nav>
  );
}

export default JobSeekerdashboardSidebar;
