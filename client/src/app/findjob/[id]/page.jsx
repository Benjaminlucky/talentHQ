// app/jobs/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import { CheckCircle2 } from "lucide-react";

// ✅ Skeleton Loader Component
function SkeletonCard({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${id}`
        );
        setJob(res.data);

        if (res.data?.company?._id) {
          const relatedRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs`,
            { params: { company: res.data.company._id, limit: 5 } }
          );
          setRelatedJobs(relatedRes.data.jobs.filter((j) => j._id !== id));
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

  // ✅ Skeleton UI when loading
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <SkeletonCard className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard className="h-48 w-full" />
          <SkeletonCard className="h-48 w-full" />
        </div>
        <SkeletonCard className="h-32 w-full" />
        <SkeletonCard className="h-32 w-full" />
      </main>
    );
  }

  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!job)
    return <div className="p-10 text-center text-gray-500">Job not found</div>;

  const responsibilities = job.responsibilities
    ?.split(",")
    .map((r) => r.trim());
  const skills = job.skills?.split(",").map((s) => s.trim());
  const benefits = job.benefits?.split(",").map((b) => b.trim());

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* MAIN CONTENT */}
        <div className="w-full lg:w-3/4">
          {/* HEADER */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                {job.company?.logo && (
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={job.company.logo}
                      alt={job.company?.companyName || "Company Logo"}
                      fill
                      className="object-contain rounded-lg border"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-col gap-1 text-gray-600 text-sm">
                    <span className="font-semibold">
                      {job.company?.companyName || "Unknown Company"}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <IoLocationOutline className="text-lime-500" />
                      {job.location}
                      <FiBriefcase className="text-lime-500 ml-2" />
                      {job.type}
                      <span className="ml-2">{job.jobFor}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button className="w-full border border-lime-500 px-4 py-2 rounded-lg text-lime-600 font-medium hover:bg-lime-50 transition">
                  View Company
                </button>
              </div>
            </div>
          </div>

          {/* SALARY HIGHLIGHT */}
          {job.salary && (
            <div className="mt-6 bg-gradient-to-r from-lime-50 to-lime-100 border border-lime-200 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compensation
              </h3>
              <p className="text-2xl font-bold text-lime-700 flex items-center gap-2">
                💰 ₦{job.salary}
              </p>
              {job.deadline && (
                <p className="text-sm text-gray-600 mt-2">
                  Apply before{" "}
                  <span className="font-medium text-gray-800">
                    {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </p>
              )}

              {/* Sticky Apply Now for mobile */}
              <div className="hidden md:block">
                <button className="mt-4 w-full bg-lime-500 px-4 py-3 rounded-lg text-white font-semibold hover:bg-lime-600 transition shadow">
                  Apply Now
                </button>
              </div>
            </div>
          )}

          {/* ABOUT */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              About this role
            </h2>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </section>

          {/* RESPONSIBILITIES + QUALIFICATION */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Responsibilities
              </h3>
              {responsibilities?.length ? (
                <ul className="space-y-3">
                  {responsibilities.map((res, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 bg-lime-50 px-3 py-2 rounded-lg"
                    >
                      <CheckCircle2 className="text-lime-600 mt-1" size={18} />
                      <span className="text-gray-700">{res}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No responsibilities listed</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Qualification
              </h3>
              <p className="italic bg-gray-50 border-l-4 border-lime-500 p-4 rounded text-gray-700">
                {job.qualification || "Not specified"}
              </p>
            </div>
          </section>

          {/* SKILLS + BENEFITS */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Skills
              </h3>
              {skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-lime-100 text-lime-600 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Benefits
              </h3>
              {benefits?.length ? (
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No benefits listed</p>
              )}
            </div>
          </section>

          {/* JOB DETAILS */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Job Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Category</dt>
                <dd>{job.category || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Experience Level</dt>
                <dd>{job.experienceLevel || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Deadline</dt>
                <dd>
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Job For</dt>
                <dd>{job.jobFor}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Posted By</dt>
                <dd>{job.postedBy}</dd>
              </div>
              {job.state && (
                <div>
                  <dt className="font-medium text-gray-600">State</dt>
                  <dd>{job.state}</dd>
                </div>
              )}
              {job.lga && (
                <div>
                  <dt className="font-medium text-gray-600">LGA</dt>
                  <dd>{job.lga}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* CONTACT INFO */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <dl className="space-y-3 text-gray-700 text-sm">
              {job.phoneNumber && (
                <div>
                  <dt className="font-medium text-gray-600">Phone</dt>
                  <dd>{job.phoneNumber}</dd>
                </div>
              )}
              {job.address && (
                <div>
                  <dt className="font-medium text-gray-600">Address</dt>
                  <dd>{job.address}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Other Jobs at {job.company?.companyName || "Company"}
            </h3>
            {relatedJobs.length ? (
              <ul className="space-y-4 text-sm text-gray-700">
                {relatedJobs.map((rj) => (
                  <li key={rj._id}>
                    <a
                      href={`/jobs/${rj._id}`}
                      className="block hover:text-lime-600 transition"
                    >
                      {rj.title}
                    </a>
                    <p className="text-xs text-gray-500">
                      {rj.type} • {rj.location}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No other jobs available.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Sticky Apply Now Button for Mobile */}
      {job.salary && (
        <div className="fixed bottom-0 left-0 mt-64 w-full bg-white border-t border-gray-200 p-4 md:hidden shadow-lg">
          <button className="w-full bg-lime-500 px-4 py-3 rounded-lg text-white font-semibold hover:bg-lime-600 transition">
            Apply Now
          </button>
        </div>
      )}
    </main>
  );
}
