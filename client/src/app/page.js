"use client";

import { motion, useAnimation } from "framer-motion";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { featuredJobs } from "../../data";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";

const rotatingWords = ["Find Jobs", "Post Job", "Find Candidates"];

const options = [
  { name: "Select Need", value: "" },
  { name: "Post Job", value: "postJob" },
  { name: "Find Job", value: "findJob" },
  { name: "Find Candidate", value: "findCandidate" },
];

export default function HomePage() {
  const [selected, setSelected] = useState(options[0]);
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
    <main className="flex items-center justify-center px-4">
      <div className="w-full">
        <div className="bg-white max-w-4xl mx-auto py-8 px-8 mt-12 rounded-2xl shadow-md">
          {/* Rotating Text */}
          <div className="h-10 overflow-hidden mb-6 text-2xl font-bold text-center text-gray-800">
            <motion.div
              animate={{
                y: ["0%", "-100%", "-200%", "0%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 1],
              }}
              className="space-y-2"
            >
              {rotatingWords.map((word, idx) => (
                <div key={idx}>{word}</div>
              ))}
            </motion.div>
          </div>

          {/* Search Form */}
          <form className="flex flex-col md:flex-row gap-4 items-stretch">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              placeholder="Search for jobs, companies, or locations"
            />

            {/* Custom Select Dropdown */}
            <div className="w-full md:w-1/3 relative">
              <Listbox value={selected} onChange={setSelected}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 hover:bg-gray-100 transition">
                    <span className="block truncate">{selected.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {options.map((option, index) => (
                      <Listbox.Option
                        key={index}
                        value={option}
                        className={({ active }) =>
                          clsx(
                            "cursor-default select-none py-2 px-4",
                            active
                              ? "bg-lime-100 text-lime-900"
                              : "text-gray-900"
                          )
                        }
                      >
                        {option.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-lime-500 text-white font-semibold rounded-md hover:bg-lime-700 transition duration-300"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Featured Jobs Infinite Scroll */}
        <div className="featuredJobs mt-12 overflow-hidden">
          <h2 className="text-4xl font-bold text-center text-gray-300 my-8">
            Featured Jobs
          </h2>

          {/* Infinite Scrolling Container */}
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
                  className="min-w-[300px] max-w-xs w-full p-6 rounded-lg bg-white shadow-md flex-shrink-0"
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
                      <p className="text-gray-800 font-semibold">
                        {job.salary}
                      </p>
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
      </div>
    </main>
  );
}
