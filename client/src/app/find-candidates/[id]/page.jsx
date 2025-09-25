"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Skeleton loader component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [relatedApplications, setRelatedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/profile/applications/${id}`);
        if (!res.ok) throw new Error("Failed to fetch candidate details");
        const data = await res.json();
        setCandidate(data);

        // Fetch other applications by same candidate (limit 5)
        if (data?.jobseeker?._id) {
          const relatedRes = await fetch(
            `${baseUrl}/api/profile/applications?jobseeker=${data.jobseeker._id}&limit=5`
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedApplications(
              (relatedData.applications || relatedData).filter(
                (a) => a._id !== id
              )
            );
          }
        }
      } catch (err) {
        console.error("Error fetching candidate details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCandidate();
  }, [id, baseUrl]);

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto p-6">
        {/* Main Skeleton */}
        <div className="w-full lg:w-3/4 space-y-10">
          {/* Profile Header Skeleton */}
          <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl shadow-md p-6 bg-gradient-to-r from-lime-50 to-white">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>

          {/* Applied Role Skeleton */}
          <Card className="rounded-2xl shadow-lg border-l-8 border-lime-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
            </CardContent>
          </Card>

          {/* Other section skeletons */}
          {[
            "Resume",
            "Cover Letter",
            "Education",
            "Projects",
            "Certifications",
            "Work Experience",
            "Skills",
          ].map((section, idx) => (
            <Card key={idx} className="rounded-2xl shadow-md">
              <CardHeader>
                <Skeleton className="h-5 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-3">
            <Skeleton className="h-5 w-2/3" />
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    );
  }

  if (!candidate) {
    return <p className="p-8 text-red-500">Candidate not found.</p>;
  }

  const { jobseeker } = candidate;

  return (
    <main className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Main Content */}
      <div className="w-full lg:w-3/4 space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-gradient-to-r from-lime-50 to-white rounded-2xl shadow-md p-6">
          <img
            src={jobseeker?.avatar || "/default-avatar.png"}
            alt={jobseeker?.fullName || "Candidate"}
            className="w-32 h-32 rounded-full object-cover ring-4 ring-lime-200"
          />
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-800">
              {jobseeker?.fullName}
            </h2>
            <p className="text-gray-600">{jobseeker?.headline}</p>
            <p className="italic text-sm text-gray-500">{jobseeker?.tagline}</p>
            <div className="text-sm text-gray-500 space-y-1">
              {jobseeker?.email && <p>📧 {jobseeker.email}</p>}
              {jobseeker?.location && (
                <p>
                  📍 {jobseeker.location.city || ""}{" "}
                  {jobseeker.location.country || ""}
                </p>
              )}
              {jobseeker?.linkedin && (
                <p>
                  🔗{" "}
                  <a
                    href={jobseeker.linkedin}
                    className="text-lime-700 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn Profile
                  </a>
                </p>
              )}
              {jobseeker?.github && (
                <p>
                  💻{" "}
                  <a
                    href={jobseeker.github}
                    className="text-lime-700 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Profile
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Applied Role */}
        <Card className="rounded-2xl shadow-lg border-l-8 border-lime-500">
          <CardHeader className="flex flex-col lg:flex-row items-center justify-between">
            <CardTitle className="text-xl mb-5 font-bold text-lime-700">
              Applied Role: {candidate.roleTitle || "N/A"}
            </CardTitle>
            <Button className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-xl shadow-md">
              Hire Candidate
            </Button>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>Type:</strong> {candidate.roleType || "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="px-2 py-1 rounded-full bg-lime-100 text-lime-700 text-xs font-medium">
                {candidate.status || "pending"}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card className="rounded-2xl shadow-md bg-gray-50">
          <CardHeader>
            <CardTitle>📄 Resume / CV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-medium">
              {candidate.resumeAvailable
                ? "Resume is available upon request from the candidate."
                : "No resume uploaded."}
            </p>
          </CardContent>
        </Card>

        {/* Cover Letter */}
        {candidate.coverLetter && (
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>✉️ Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-lime-500 pl-4 italic text-gray-700 leading-relaxed">
                {candidate.coverLetter}
              </blockquote>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {jobseeker?.education?.length > 0 && (
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>🎓 Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {jobseeker.education.map((e, idx) => (
                <div key={idx} className="border-b pb-2 last:border-0">
                  <p className="font-semibold text-gray-800">{e.degree}</p>
                  <p className="text-gray-500">
                    {e.institution} –{" "}
                    {e.graduationYear ||
                      (e.graduationDate
                        ? new Date(e.graduationDate).getFullYear()
                        : "")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {jobseeker?.projects?.length > 0 && (
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>💡 Portfolio / Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {jobseeker.projects.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                >
                  {p.link ? (
                    <a
                      href={p.link}
                      className="text-lime-600 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.title}
                    </a>
                  ) : (
                    <span className="font-medium">{p.title}</span>
                  )}
                  {p.description && (
                    <p className="text-gray-500 mt-1">{p.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {jobseeker?.certifications?.length > 0 && (
          <Card className="rounded-2xl shadow-md bg-lime-50">
            <CardHeader>
              <CardTitle>🏅 Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {jobseeker.certifications.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-white">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-gray-500">
                    {c.organization} –{" "}
                    {c.dateEarned
                      ? new Date(c.dateEarned).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Work Experience */}
        {jobseeker?.workExperience?.length > 0 && (
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>💼 Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {jobseeker.workExperience.map((w, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                  <p className="font-semibold text-gray-800">
                    {w.title} @ {w.company}
                  </p>
                  <p className="text-gray-500">
                    {w.startDate
                      ? new Date(w.startDate).toLocaleDateString()
                      : ""}{" "}
                    -{" "}
                    {w.endDate
                      ? new Date(w.endDate).toLocaleDateString()
                      : "Present"}
                  </p>
                  {w.description && (
                    <p className="text-gray-600 mt-1">{w.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {jobseeker?.skill?.length > 0 && (
          <Card className="rounded-2xl shadow-md bg-gray-50">
            <CardHeader>
              <CardTitle>🛠 Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {jobseeker.skill.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                >
                  {s.name || s}
                </span>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Other Applications by {jobseeker?.fullName}
          </h3>
          {relatedApplications.length ? (
            <ul className="space-y-4 text-sm text-gray-700">
              {relatedApplications.map((app) => (
                <li key={app._id}>
                  <a
                    href={`/candidates/${app._id}`}
                    className="block hover:text-lime-600 transition"
                  >
                    {app.roleTitle}
                  </a>
                  <p className="text-xs text-gray-500">
                    {app.roleType} •{" "}
                    {app.jobseeker?.location?.city || "Unknown"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No other applications.</p>
          )}
        </div>
      </aside>
    </main>
  );
}
