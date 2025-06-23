"use client";

import { motion, useAnimation } from "framer-motion";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { featuredJobs } from "../../data";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import FeaturedJobs from "@/components/FeaturedJobs";
import FeaturedCandidates from "@/components/FeaturedCandidates";
import FeaturedHandymen from "@/components/FeaturedHandymen";
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";

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
        <FeaturedJobs />
        <FeaturedCandidates />
        <FeaturedHandymen />
      </div>
    </main>
  );
}
