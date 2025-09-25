// src/app/find-candidates/page.jsx
"use client";

import { useEffect, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import { useRouter } from "next/navigation";

const roleTypes = ["Full-time", "Part-time", "Contract"];
const candidatesPerPage = 9;

export default function FindCandidatesPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [roleType, setRoleType] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  // reset when filters change
  useEffect(() => {
    setApplications([]);
    setCurrentPage(1);
  }, [search, location, roleType]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${baseUrl}/api/profile/applications?search=${search}&location=${location}&roleType=${roleType}&page=${currentPage}&limit=${candidatesPerPage}`
        );
        if (!res.ok) throw new Error("Failed to fetch candidates");
        const data = await res.json();

        setApplications((prev) =>
          currentPage === 1
            ? data.applications || data
            : [...prev, ...(data.applications || data)]
        );
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        if (currentPage === 1) setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [search, location, roleType, currentPage, baseUrl]);

  const handleViewCandidate = (id) => {
    router.push(`/find-candidates/${id}`);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const SkeletonCard = () => (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-md animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 w-28 bg-gray-700 rounded mb-3" />
          <div className="h-4 w-20 bg-gray-800 rounded" />
        </div>
        <div className="w-16 h-16 rounded-full bg-gray-700" />
      </div>
      <div className="h-3 w-full bg-gray-700 rounded mb-2" />
      <div className="h-3 w-3/4 bg-gray-700 rounded mb-4" />
      <div className="h-10 w-full bg-gray-700 rounded-full" />
    </div>
  );

  const CandidateCard = ({ app }) => (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {app.roleTitle || "Role not specified"}
          </h3>
          <p className="text-lime-400 font-medium text-base">
            {app.jobseeker?.fullName || "Anonymous"}
          </p>
        </div>
        <img
          src={app.jobseeker?.avatar || "/default-avatar.png"}
          alt={app.jobseeker?.fullName || "candidate"}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-lime-400"
        />
      </div>

      <p className="text-gray-400 text-sm mb-6 line-clamp-3">
        {app.coverLetter || "No cover letter provided."}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
        <div className="flex items-center gap-2">
          <IoLocationOutline className="text-lime-400 text-lg" />
          <span className="text-sm text-white">
            {app.jobseeker?.location
              ? `${app.jobseeker.location.city || ""} ${
                  app.jobseeker.location.country || ""
                }`
              : "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FiBriefcase className="text-lime-400 text-lg" />
          <span className="text-sm text-white">{app.roleType || "N/A"}</span>
        </div>
      </div>

      <button
        className="w-full px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
        onClick={() => handleViewCandidate(app._id)}
      >
        View Candidate
      </button>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-800 py-10 px-4 md:px-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-700">
        Find Candidates
      </h1>

      {/* Filters */}
      <form
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-6xl mx-auto"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          placeholder="Search by name or role..."
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
          value={roleType}
          onChange={(e) => setRoleType(e.target.value)}
        >
          <option value="">All Role Types</option>
          {roleTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </form>

      {/* Candidates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {loading && applications.length === 0
          ? Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
          : applications.map((app) => (
              <CandidateCard key={app._id} app={app} />
            ))}
      </div>

      {/* Load More */}
      {!loading && currentPage < totalPages && (
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
  );
}
