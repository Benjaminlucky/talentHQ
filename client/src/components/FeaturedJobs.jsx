"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import { useRouter } from "next/navigation";
import LoadingButton from "./LoadingButton";

export default function FeaturedJobs({
  search = "",
  location = "",
  category = "",
  jobType = "",
  currentPage = 1,
  jobsPerPage = 10,
}) {
  const controls = useAnimation();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // continuous auto-scroll (same as FeaturedCandidates)
  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        repeat: Infinity,
        duration: 40, // adjust speed
        ease: "linear",
      },
    });
  }, [controls]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
        const res = await axios.get(`${baseUrl}/api/jobs`, {
          params: {
            search,
            location,
            category,
            jobType,
            page: currentPage,
            limit: jobsPerPage,
          },
        });
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [search, location, category, jobType, currentPage, jobsPerPage]);

  const SkeletonCard = () => (
    <div className="min-w-[300px] max-w-xs w-full my-12 p-6 rounded-2xl bg-white shadow-md flex-shrink-0 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-5/6 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between mb-4">
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between mt-6">
        <div>
          <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="featuredJobs mt-12 overflow-hidden">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 my-8">
        Featured Jobs
      </h2>

      {isLoading && (
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-4">
            {[...Array(4)].map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && jobs.length === 0 && (
        <p className="text-center text-gray-400">
          No jobs available right now.
        </p>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-6 px-4 md:px-0 w-max"
            animate={controls}
            onMouseEnter={() => controls.stop()}
            onMouseLeave={() =>
              controls.start({
                x: ["0%", "-50%"],
                transition: {
                  repeat: Infinity,
                  duration: 40,
                  ease: "linear",
                },
              })
            }
          >
            {[...jobs, ...jobs].map((job, idx) => (
              <div
                key={idx}
                className="min-w-[300px] max-w-xs w-full my-6 p-6 rounded-2xl bg-white shadow-md flex-shrink-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {job.company?.companyName || "Unknown Company"}
                    </p>
                  </div>
                  {job.company?.logo && (
                    <img
                      src={job.company.logo}
                      alt={job.company.companyName}
                      className="w-12 h-12 object-contain rounded-full border"
                    />
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 break-words line-clamp-3">
                  {job.description?.slice(0, 100) || "No description"}...
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <IoLocationOutline className="text-lime-500" />
                    <span className="line-clamp-1">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiBriefcase className="text-lime-500" />
                    <span>{job.type}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div>
                    <p className="text-gray-800 font-semibold">
                      {job.salary || "Not specified"}
                    </p>
                    {job.deadline && (
                      <p className="text-gray-500 text-xs">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <LoadingButton
                    className="px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-xl hover:bg-lime-700 transition"
                    onClick={() => router.push(`/findjob/${job._id}`)}
                    loadingText="Opening..."
                  >
                    View Details
                  </LoadingButton>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
