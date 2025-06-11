"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

import { IoLocationOutline } from "react-icons/io5";
import { FiTool } from "react-icons/fi";
import { handymanCandidates } from "../../data";

export default function FeaturedHandymen() {
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
        Featured Handymen
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
          {[...handymanCandidates, ...handymanCandidates].map(
            (candidate, idx) => (
              <div
                key={idx}
                className="min-w-[300px] max-w-xs w-full p-6 rounded-lg bg-black shadow-md flex-shrink-0 hover:shadow-lg transition duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {candidate.role}
                    </h3>
                    <p className=" text-primary-500 font-semibold text-lg">
                      {candidate.name}
                    </p>
                  </div>
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>

                <p className="text-gray-600 text-sm mb-4 break-words line-clamp-3">
                  {candidate.brief}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <FiTool className="text-lime-500" />
                    <span className="text-sm text-white">
                      {candidate.specialization ||
                        candidate.certification ||
                        "Skilled Professional"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoLocationOutline className="text-lime-500" />
                    <span className="text-sm text-gray-50">
                      {candidate.location}
                    </span>
                  </div>
                </div>

                <div className="flex w-full items-center mt-6">
                  <button className="w-full px-3 py-2 border border-lime-500 text-white text-sm font-medium rounded-full hover:bg-lime-700 transition">
                    View Candidate
                  </button>
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
