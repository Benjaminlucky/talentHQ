// src/app/find-jobs/page.jsx
"use client";

import { useEffect, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import { useRouter } from "next/navigation";
import axios from "axios";

const uniqueCategories = ["IT", "Plumbing", "Teaching"];
const jobTypes = ["Full-time", "Part-time", "Contract"];
const jobsPerPage = 9;

export default function FindJobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  useEffect(() => {
    // Reset jobs when filters change
    setJobs([]);
    setCurrentPage(1);
  }, [search, location, category, jobType]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs`,
          {
            params: {
              search,
              location,
              category,
              jobType,
              page: currentPage,
              limit: jobsPerPage,
            },
          }
        );

        // Append new jobs instead of replacing
        setJobs((prev) =>
          currentPage === 1
            ? res.data.jobs || []
            : [...prev, ...(res.data.jobs || [])]
        );

        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        if (currentPage === 1) setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [search, location, category, jobType, currentPage]);

  const handleApply = (jobId) => {
    router.push(`/findjob/${jobId}`);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen text-gray-800 py-10 px-4 md:px-16">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-700">
        Find Your Next Job
      </h1>

      {/* Search + Filter Form */}
      <form
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-24 max-w-6xl mx-auto"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          placeholder="Search job title..."
          className="px-4 py-3 border rounded-md focus:outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          className="px-4 py-3 border rounded-md focus:outline-none w-full"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select
          className="px-4 py-3 border rounded-md focus:outline-none w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <select
          className="px-4 py-3 border rounded-md focus:outline-none w-full"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="">All Job Types</option>
          {jobTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </form>

      {/* Jobs Grid */}
      <div className="grid md:grid-cols-[3fr_1fr] gap-8">
        {/* Jobs Listing */}
        <div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {isLoading && jobs.length === 0
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-lg bg-white shadow-md animate-pulse"
                  >
                    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-3 w-5/6 bg-gray-100 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                ))
              : jobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {job.company?.companyName || "Unknown Company"}
                        </p>
                      </div>
                      {job.company?.logo && (
                        <img
                          src={job.company.logo}
                          alt={job.company.companyName}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {job.description?.slice(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <IoLocationOutline className="text-lime-500" />
                        <span>{job.location}</span>
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
                        <p className="text-gray-500 text-xs">
                          Deadline:{" "}
                          {job.deadline
                            ? new Date(job.deadline).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <button
                        className="px-3 py-2 bg-lime-500 text-white text-sm font-medium rounded hover:bg-lime-700 transition"
                        onClick={() => handleApply(job._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
          </div>

          {/* Load More Button */}
          {!isLoading && currentPage < totalPages && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-lime-500 text-white text-sm font-medium rounded hover:bg-lime-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white shadow-md rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Sponsored</h3>
            <img
              src="/ads/sample-ad.jpg"
              alt="Ad Banner"
              className="w-full rounded-md"
            />
          </div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Partner Gigs</h3>
            <p className="text-sm text-gray-600">
              Explore freelance work from verified platforms.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
