// app/jobs/[id]/JobDetails.jsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";

export default function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [jobId]);

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!job)
    return <div className="p-10 text-center text-red-500">Job not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
          <p className="text-gray-600">
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

      <p className="text-gray-600 mb-4">{job.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <IoLocationOutline className="text-lime-500" />
          <span>
            <strong>Location:</strong> {job.location}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FiBriefcase className="text-lime-500" />
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
        {job.experienceLevel && (
          <p>
            <strong>Experience Level:</strong> {job.experienceLevel}
          </p>
        )}
        <p>
          <strong>Salary:</strong> {job.salary || "Not specified"}
        </p>
        <p>
          <strong>Job For:</strong> {job.jobFor}
        </p>
        <p>
          <strong>Posted By:</strong> {job.postedBy}
        </p>
        <p>
          <strong>Deadline:</strong>{" "}
          {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}
        </p>
      </div>

      <button
        className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-700 transition"
        onClick={() => alert("Apply functionality to be implemented")}
      >
        Apply Now
      </button>
    </div>
  );
}
