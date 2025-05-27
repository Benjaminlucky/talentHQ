import { featuredJobs } from "../../../../data";
import "./page.css";
import Link from "next/link";

export async function generateStaticParams() {
  return featuredJobs.map((job) => ({ id: job.id.toString() }));
}

export default async function JobDetailPage({ params }) {
  const job = featuredJobs.find((job) => job.id.toString() === params.id);

  if (!job) {
    return <div className="p-10 text-center text-red-500">Job not found</div>;
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-6">
      <div className="wrapper w-full mx-auto">
        <div className="jobContent w-full">
          <div className="jobTitle w-full bg-primary-200 rounded-md">
            <div className="titleContent w-full flex flex-col px-6 sm:px-10 md:px-16 py-16 sm:py-20">
              <h2 className="w-full flex text-center md:text-left text-4xl sm:text-5xl md:text-6xl font-bold">
                {job.title}
              </h2>
              <p className="w-full text-black text-3xl text-center md:text-left sm:text-4xl md:text-6xl flex-wrap items-center gap-3 sm:gap-6 mt-2">
                <span className="px-2">at</span>
                <span className="font-bold">{job.company}</span>
              </p>
              <div className="buttons w-full md:w-6/12 py-10 flex flex-col md:flex-row gap-3">
                <button className="bg-white w-full uppercase px-6 py-3 font-semibold text-lg rounded-sm text-primary-500 hover:bg-lime-50 transition-all duration-300">
                  View Company
                </button>

                <Link
                  href={`/signup?redirect=/jobs/${job.id}`}
                  passHref
                  className="bg-lime-500 text-center uppercase w-full px-6 py-3 uppercase font-semibold text-lg rounded-sm text-white hover:bg-lime-700 transition-all duration-300"
                >
                  <button className="uppercase">Apply for this job</button>
                </Link>
              </div>
            </div>
          </div>

          <div className="jobDetails py-12 w-full">
            <div className="detailsWrapper w-full">
              <div className="title">
                <h5 className="py-8 font-bold text-gray-500 text-2xl sm:text-3xl">
                  About this Role
                </h5>
              </div>
              <div className="detailsContent w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center gap-8">
                {/* About Company */}
                <div className="aboutCompany">
                  <div className="companyContent">
                    <div className="companyInfo w-full  flex flex-col justify-center md:flex-row items-start gap-4">
                      <div className="logo flex-shrink-0 bg-white p-2 rounded-md">
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          className="w-20 md:w-30"
                        />
                      </div>
                      <div className="info">
                        <div className="role text-sm font-bold text-primary-500">
                          {job.title}{" "}
                          <span className="text-gray-400">{job.mode}</span>
                        </div>
                        <div className="companyLocation">
                          <div className="company text-black font-bold">
                            {job.company}
                          </div>
                          <div className="location">{job.location}</div>
                          <div className="salary text-gray-900 font-bold">
                            {job.salary}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Brief */}
                <div className="jobBrief">
                  <div className="briefContent">
                    <p className="text-justify hyphens-auto">
                      {job.detailedBrief}
                    </p>
                  </div>
                </div>

                {/* Skills and Benefits */}
                <div className="furtherDetails">
                  <div className="furtherContent">
                    <div className="qualification mb-4">
                      <h4 className="font-bold text-black text-xl">
                        Qualification
                      </h4>
                      <p>{job.qualification}</p>
                    </div>

                    <div className="skills py-4">
                      <h4 className="font-bold text-black text-xl">
                        Skills Required
                      </h4>
                      {Array.isArray(job.skills) && job.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-lime-100 text-lime-500 px-4 py-2 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-500">No skills listed</p>
                      )}
                    </div>

                    <div className="benefits py-4">
                      <h4 className="font-bold text-black text-xl">Benefits</h4>
                      {Array.isArray(job.benefits) &&
                      job.benefits.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="bg-lime-100 text-lime-500 px-4 py-2 rounded-md"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-500">No benefits listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>{" "}
              {/* End detailsContent */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
