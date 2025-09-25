"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import { useRouter } from "next/navigation";
import LoadingButton from "./LoadingButton";

export default function FeaturedCandidates() {
  const controls = useAnimation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  // Fetch candidates
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/profile/applications`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [baseUrl]);

  // Auto-scroll animation
  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        repeat: Infinity,
        duration: 60,
        ease: "linear",
      },
    });
  }, [controls]);

  // Skeleton card
  const SkeletonCard = () => (
    <div className="min-w-[320px] max-w-sm w-full p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 w-28 bg-gray-700 rounded animate-pulse mb-3" />
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
      </div>
      <div className="h-3 w-full bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-3 w-3/4 bg-gray-700 rounded animate-pulse mb-4" />
      <div className="flex items-center justify-between text-sm mb-6">
        <div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-gray-700 rounded-full animate-pulse" />
    </div>
  );

  // Candidate card
  const CandidateCard = ({ app, idx }) => (
    <motion.div
      key={`${app._id}-${idx}`}
      className="min-w-[320px] max-w-sm w-full p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-lg flex-shrink-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
    >
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

      <p className="text-gray-400 text-sm mb-6 break-words line-clamp-3">
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

      <div className="flex w-full items-center mt-4">
        <LoadingButton
          className="w-full px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={() => router.push(`/find-candidates/${app._id}`)}
          loadingText="Opening..."
        >
          View Candidate
        </LoadingButton>
      </div>
    </motion.div>
  );

  return (
    <div className="featuredJobs mt-16 overflow-hidden">
      <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent my-12">
        Featured Candidates
      </h2>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-6 w-max"
          animate={controls}
          onMouseEnter={() => controls.stop()}
          onMouseLeave={() =>
            controls.start({
              x: ["0%", "-50%"],
              transition: {
                repeat: Infinity,
                duration: 60,
                ease: "linear",
              },
            })
          }
        >
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            : [...applications, ...applications].map((app, idx) => (
                <CandidateCard key={`${app._id}-${idx}`} app={app} idx={idx} />
              ))}
        </motion.div>
      </div>
    </div>
  );
}
