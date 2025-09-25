"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";

// Skeleton Loader Component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function JobDetails() {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId, baseUrl]);

  // 🔹 Skeleton Loader
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* MAIN CONTENT */}
          <div className="w-full lg:w-3/4 space-y-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* About */}
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Job Details */}
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-4 w-40" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </aside>
        </div>
      </main>
    );
  }

  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!job)
    return <div className="p-10 text-center text-gray-500">Job not found</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* MAIN CONTENT */}
        <div className="w-full lg:w-3/4 space-y-8">
          {/* HEADER */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Logo + Info */}
              <div className="flex items-center gap-4">
                {job.company?.logo && (
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image
                      src={job.company.logo}
                      alt={`${job.company.companyName} Logo`}
                      fill
                      className="object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <span className="font-semibold">
                      {job.company?.companyName || "Unknown Company"}
                    </span>
                    • <span>{job.location}</span>
                    {job.experienceLevel && (
                      <>
                        • <span>{job.experienceLevel}</span>
                      </>
                    )}
                    • <span className="font-semibold">{job.type}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="border border-lime-500 text-lime-600 px-4 py-3 rounded-lg font-medium hover:bg-lime-50 transition">
                  View Company
                </button>
                <button
                  className="bg-lime-500 text-white px-4 py-3 rounded-lg hover:bg-lime-600 transition font-medium"
                  onClick={() => alert("Apply functionality to be implemented")}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              About this role
            </h2>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </section>

          {/* JOB DETAILS */}
          <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Job Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <IoLocationOutline className="text-lime-500 text-lg" />
                <span>
                  <strong>Location:</strong> {job.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiBriefcase className="text-lime-500 text-lg" />
                <span>
                  <strong>Type:</strong> {job.type}
                </span>
              </div>
              {job.state && (
                <p>
                  <strong>State:</strong> {job.state}
                </p>
              )}
              {job.lga && (
                <p>
                  <strong>LGA:</strong> {job.lga}
                </p>
              )}
              {job.address && (
                <p>
                  <strong>Address:</strong> {job.address}
                </p>
              )}
              {job.phoneNumber && (
                <p>
                  <strong>Phone:</strong> {job.phoneNumber}
                </p>
              )}
              {job.category && (
                <p>
                  <strong>Category:</strong> {job.category}
                </p>
              )}
              {job.salary && (
                <p>
                  <strong>Salary:</strong> {job.salary}
                </p>
              )}
              <p>
                <strong>Job For:</strong> {job.jobFor}
              </p>
              <p>
                <strong>Posted By:</strong> {job.postedBy}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Other Jobs at {job.company?.companyName || "this company"}
            </h3>
            <p className="text-gray-500 text-sm">Coming soon...</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
