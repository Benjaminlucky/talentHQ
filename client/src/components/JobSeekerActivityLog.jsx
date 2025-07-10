"use client";
import React from "react";
import dynamic from "next/dynamic";
import { MdMarkEmailRead, MdVideoCall } from "react-icons/md";
import { FaChevronRight } from "react-icons/fa6";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ———  Recharts (lazy‑loaded to dodge SSR errors in Next.js)  ———

export default function JobSeekerActivityLog() {
  const totalApplied = 37;
  const interviewCount = 15;
  const unsuitableCount = totalApplied - interviewCount;

  const pieData = [
    { name: "Interview", value: interviewCount },
    { name: "Unsuitable", value: unsuitableCount },
  ];

  const COLORS = ["#65a30d", "#6b7280"]; // lime‑700 & gray‑500

  return (
    <section className="activityLog w-full py-8">
      {/* =====  MAIN GRID  ===== */}
      <div className="content grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* ----------  Snapshot Card  ---------- */}
        <div className="snapshot flex flex-wrap items-center justify-between gap-6 bg-gray-100 p-6 rounded-md min-w-0">
          {/* — Left: Total Applied — */}
          <div className="flex flex-col items-center">
            <div className="icon text-5xl bg-white p-6 rounded-full text-lime-700 mb-2">
              <MdMarkEmailRead />
            </div>
            <h3 className="text-4xl font-semibold text-lime-700">37</h3>
            <p className="pt-2 text-gray-600">Total Job Applied</p>
          </div>

          {/* — Right: Interviewed — */}
          <div className="flex flex-col items-center">
            <div className="icon text-5xl bg-white p-6 rounded-full text-primary-500 mb-2">
              <MdVideoCall />
            </div>
            <h3 className="text-4xl font-semibold text-lime-700">12</h3>
            <p className="pt-2 text-gray-600">Interviewed</p>
          </div>
        </div>

        {/* ----------  Pie‑chart Card  ---------- */}
        <div className="jobApplied bg-gray-100 rounded-md flex items-center justify-center p-4">
          <div className="w-full h-60">
            {" "}
            {/* 👈 guarantees height */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) =>
                    `${((val / totalApplied) * 100).toFixed(0)}%`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ----------  Upcoming Interview Card  ---------- */}
        {/* xl:span-2 lets it stretch on big screens, but it collapses nicely on small ones */}
        <div className="upcomingInterviews bg-gray-100 p-6 rounded-md col-span-full lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700">
            Upcoming Interview
          </h3>
          <small className="text-gray-400">
            Today&nbsp;·&nbsp;Jan&nbsp;12,&nbsp;2022
          </small>

          <div className="upcomingWrapper flex items-center justify-between border-2 border-primary-200 rounded-md py-5 px-5 mt-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="hrImage h-10 w-10 rounded-full overflow-hidden">
                <img src="/assets/chinonso.avif" alt="HR Avatar" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Alexa Russel</h4>
                <p className="text-sm text-gray-400">HR at DigitalOcean</p>
              </div>
            </div>
            <p className="text-gray-400">10:00 AM</p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-primary-500 font-semibold mt-8 hover:underline"
          >
            View Schedule <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
