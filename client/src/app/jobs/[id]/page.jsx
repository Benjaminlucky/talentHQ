// app/jobs/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { FiBriefcase } from "react-icons/fi";
import { CheckCircle2 } from "lucide-react"; // ✅ For checklist icons

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(res.data);

        // Fetch related jobs by same company
        if (res.data?.company?._id) {
          const relatedRes = await axios.get("http://localhost:5000/api/jobs", {
            params: { company: res.data.company._id, limit: 5 },
          });
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

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!job)
    return <div className="p-10 text-center text-red-500">Job not found</div>;

  const responsibilities = job.responsibilities
    ?.split(",")
    .map((r) => r.trim());
  const skills = job.skills?.split(",").map((s) => s.trim());
  const benefits = job.benefits?.split(",").map((b) => b.trim());

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                {job.company?.logo && (
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={job.company.logo}
                      alt={job.company?.companyName || "Company Logo"}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-col  gap-2 text-gray-600">
                    <span className="font-semibold text-sm">
                      {job.company?.companyName || "Unknown Company"}
                    </span>
                    <div>
                      <span>{job.location}</span>{" "}
                      <span className="text-lime-500 font-bold">
                        {job.type}
                      </span>{" "}
                      <span>{job.jobFor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:items-center">
                <button className="border px-3 py-2 rounded text-lime-600 font-semibold hover:bg-lime-50">
                  View Company
                </button>
                <button className="bg-lime-500 text-white px-3 py-2 rounded hover:bg-lime-600 font-semibold">
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* About This Role */}
          <section className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About this role
            </h2>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </section>

          {/* Responsibilities + Qualification */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responsibilities */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
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

            {/* Qualification */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Qualification
              </h3>
              <p className="italic bg-gray-50 border-l-4 border-lime-500 p-4 rounded text-gray-700">
                {job.qualification || "Not specified"}
              </p>
            </div>
          </section>

          {/* Skills + Benefits */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
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

            {/* Benefits */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
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

          {/* Job Details */}
          <section className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
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
                <dt className="font-medium text-gray-600">Salary</dt>
                <dd>{job.salary || "Not specified"}</dd>
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

          {/* Contact Info */}
          <section className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
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

        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
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
    </main>
  );
}
