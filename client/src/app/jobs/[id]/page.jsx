import { featuredJobs } from "../../../../data";
import "./page.css";
import Link from "next/link";
import Image from "next/image"; // ✅ Don't forget to import this

export async function generateStaticParams() {
  return featuredJobs.map((job) => ({ id: job.id.toString() }));
}

export default async function JobDetailPage({ params }) {
  const job = featuredJobs.find((job) => job.id.toString() === params.id);

  if (!job) {
    return <div className="p-10 text-center text-red-500">Job not found</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-6">
              {/* Left section: Logo + Title + Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start md: gap-4">
                {/* ✅ Company Logo */}
                {job.companyLogo && (
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={job.companyLogo}
                      alt={`${job.company} Logo`}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                )}

                {/* Title + Info */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <span className="font-semibold">{job.company}</span> •
                    <span>{job.location}</span> •
                    <span>{job.experience || "2-4 Years"}</span> •
                    <span>{job.type}</span> •<span>{job.mode}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:items-center">
                <button className="border px-4 py-2 rounded text-lime-600 font-semibold hover:bg-lime-50">
                  View Company
                </button>
                <Link href={`/signup?redirect=/jobs/${job.jobId}`}>
                  <button className="bg-lime-500 text-white px-5 py-2 rounded hover:bg-lime-600 font-semibold">
                    Apply Now
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* About This Role */}
          <section className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About this role
            </h2>
            <p className="text-gray-700">{job.detailedBrief}</p>
          </section>

          {/* Qualifications, Responsibilities, Skills */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Qualification
              </h3>
              <p className="text-gray-700">{job.qualification}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Responsibilities
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {job.responsibilities?.map((res, i) => (
                  <li key={i}>{res}</li>
                )) || <p>No responsibilities listed</p>}
              </ul>
            </div>
          </section>

          {/* Skills and Benefits */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Skills
              </h3>
              {job.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
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

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Benefits
              </h3>
              {job.benefits?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, i) => (
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
        </div>

        {/* Sidebar (Similar Jobs Placeholder) */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Other Jobs at {job.company}
            </h3>
            <ul className="space-y-4 text-sm text-gray-700">
              {featuredJobs
                .filter((j) => j.company === job.company && j.id !== job.id)
                .map((related) => (
                  <li key={related.id}>
                    <Link
                      href={`/jobs/${related.id}`}
                      className="hover:text-lime-600 transition"
                    >
                      {related.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {related.type} • {related.mode}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
