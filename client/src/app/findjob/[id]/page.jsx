import JobDetail from "./JobDetails";

export async function generateStaticParams() {
  const res = await fetch("http://localhost:5000/api/jobs", {
    cache: "no-store",
  });
  const data = await res.json();
  const jobsArray = Array.isArray(data.jobs) ? data.jobs : [];

  return jobsArray.map((job) => ({
    id: job._id.toString(),
  }));
}

export default function JobDetailPage({ params }) {
  return <JobDetail jobId={params} />;
}
