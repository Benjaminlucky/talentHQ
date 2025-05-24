"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { featuredJobs } from "../../data";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";

export default function FeaturedJobs() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: ["0%", "-100%"],
      transition: {
        repeat: Infinity,
        duration: 60,
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <div className="featuredJobs mt-12 overflow-hidden">
      <h2 className="text-4xl font-bold text-center text-gray-300 my-8">
        Featured Jobs
      </h2>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-4 w-max"
          animate={controls}
          onMouseEnter={() => controls.stop()}
          onMouseLeave={() =>
            controls.start({
              x: ["0%", "-100%"],
              transition: {
                repeat: Infinity,
                duration: 60,
                ease: "linear",
              },
            })
          }
        >
          {[...featuredJobs, ...featuredJobs].map((job, idx) => (
            <div
              key={idx}
              className="min-w-[300px] max-w-xs w-full p-6 rounded-lg bg-white shadow-md flex-shrink-0 hover:shadow-lg transition duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-12 h-12 object-contain"
                />
              </div>

              <p className="text-gray-600 text-sm mb-4 break-words line-clamp-3">
                {job.brief}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <IoLocationOutline className="text-lime-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiBriefcase className="text-lime-500" />
                  <span>{job.mode}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div>
                  <p className="text-gray-800 font-semibold">{job.salary}</p>
                  <p className="text-gray-500 text-xs">{job.time}</p>
                </div>
                <button className="px-3 py-2 bg-lime-500 text-white text-sm font-medium rounded hover:bg-lime-700 transition">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
