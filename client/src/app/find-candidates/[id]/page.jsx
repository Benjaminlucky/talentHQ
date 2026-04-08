"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Mail,
  Globe,
  Github,
  Linkedin,
  GraduationCap,
  Award,
  Code2,
  FileText,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Building2,
} from "lucide-react";

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function SkeletonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 flex gap-5">
            <Sk className="w-24 h-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-6 w-48" />
              <Sk className="h-4 w-64" />
              <Sk className="h-4 w-36" />
              <div className="flex gap-2 mt-3">
                <Sk className="h-7 w-24 rounded-full" />
                <Sk className="h-7 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <Sk className="h-36 w-full" />
          <Sk className="h-48 w-full" />
          <Sk className="h-36 w-full" />
        </div>
        <div className="lg:w-72 space-y-4">
          <Sk className="h-48 w-full" />
          <Sk className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6">
    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
      {Icon && <Icon size={15} className="text-lime-600" />}
      {title}
    </h2>
    {children}
  </div>
);

function RelatedCard({ app }) {
  const name = app.jobseeker?.fullName || "Candidate";
  return (
    <Link
      href={`/find-candidates/${app._id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
    >
      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-lime-700 transition-colors">
          {app.roleTitle}
        </p>
        <p className="text-xs text-gray-400 truncate">{name}</p>
      </div>
      <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
    </Link>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${base}/api/profile/applications/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setCandidate(data);

        if (data?.jobseeker?._id) {
          try {
            const relRes = await fetch(
              `${base}/api/profile/applications?limit=6`,
            );
            if (relRes.ok) {
              const relData = await relRes.json();
              const list =
                relData.applications || (Array.isArray(relData) ? relData : []);
              setRelated(list.filter((a) => a._id !== id).slice(0, 5));
            }
          } catch {}
        }
      } catch {
        setError("Candidate not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, base]);

  if (loading) return <SkeletonPage />;

  if (error || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">
            {error || "Candidate not found"}
          </p>
          <Link
            href="/find-candidates"
            className="text-sm text-lime-700 underline"
          >
            ← Back to candidates
          </Link>
        </div>
      </div>
    );
  }

  const js = candidate.jobseeker || {};
  const fullName = js.fullName || "Candidate";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    typeof js.location === "object"
      ? [js.location?.city, js.location?.country].filter(Boolean).join(", ")
      : js.location || "";

  const skills = js.skill || js.skills || [];
  const workExp = js.workExperience || [];
  const education = js.education || [];
  const certifications = js.certifications || [];
  const projects = js.projects || [];

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    reviewed: "bg-blue-50 text-blue-700 border border-blue-200",
    accepted: "bg-lime-50 text-lime-700 border border-lime-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/find-candidates" className="hover:text-gray-600">
            Candidates
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">{fullName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── MAIN ──────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Profile header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                {js.avatar ? (
                  <img
                    src={js.avatar}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-lime-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-3 mb-1">
                    <h1 className="text-2xl font-black text-gray-900 flex-1">
                      {fullName}
                    </h1>
                    {candidate.status && (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[candidate.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {candidate.status}
                      </span>
                    )}
                  </div>

                  {js.headline && (
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      {js.headline}
                    </p>
                  )}

                  <p className="text-base font-bold text-lime-700 mb-3">
                    {candidate.roleTitle}
                  </p>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                    {locationStr && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400" />
                        {locationStr}
                      </span>
                    )}
                    {candidate.roleType && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={13} className="text-gray-400" />
                        {candidate.roleType}
                      </span>
                    )}
                    {candidate.preferredLocation && (
                      <span className="flex items-center gap-1.5 text-lime-700 font-medium">
                        <MapPin size={13} />
                        Prefers: {candidate.preferredLocation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {js.linkedin && (
                      <a
                        href={js.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                      >
                        <Linkedin size={13} /> LinkedIn
                      </a>
                    )}
                    {js.github && (
                      <a
                        href={js.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-700 hover:underline"
                      >
                        <Github size={13} /> GitHub
                      </a>
                    )}
                    {candidate.resumeAvailable && (
                      <span className="flex items-center gap-1.5 text-xs text-lime-700">
                        <FileText size={13} /> Resume available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Applied role / cover letter */}
            <Section title="Application" icon={Briefcase}>
              <div className="mb-4 flex flex-wrap gap-3">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                    Role
                  </p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {candidate.roleTitle}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                    Type
                  </p>
                  <p className="font-semibold text-gray-700 mt-0.5">
                    {candidate.roleType}
                  </p>
                </div>
                {candidate.preferredLocation && (
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                      Location
                    </p>
                    <p className="font-semibold text-gray-700 mt-0.5">
                      {candidate.preferredLocation}
                    </p>
                  </div>
                )}
              </div>
              {candidate.coverLetter && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-2">
                    Cover Letter
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {candidate.coverLetter}
                  </p>
                </div>
              )}
              {candidate.portfolioLinks?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-2">
                    Portfolio
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-lime-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={11} /> {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Skills */}
            {skills.length > 0 && (
              <Section title="Skills" icon={Code2}>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => {
                    const name = typeof s === "object" ? s.name : s;
                    const level = typeof s === "object" ? s.level : null;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-lime-50 text-lime-700 rounded-full border border-lime-100 font-medium"
                      >
                        {name}
                        {level && (
                          <span className="text-lime-500 opacity-70">
                            · {level}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Work Experience */}
            {workExp.length > 0 && (
              <Section title="Work Experience" icon={Building2}>
                <div className="space-y-5">
                  {workExp.map((w, i) => (
                    <div
                      key={i}
                      className={`${i < workExp.length - 1 ? "pb-5 border-b border-gray-100" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {w.jobTitle}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                            <Building2 size={12} className="text-gray-400" />
                            {w.company}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 text-right flex-shrink-0">
                          {w.startDate?.slice(0, 7)} —{" "}
                          {w.endDate ? w.endDate.slice(0, 7) : "Present"}
                        </p>
                      </div>
                      {w.description && (
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          {w.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <Section title="Education" icon={GraduationCap}>
                <div className="space-y-4">
                  {education.map((e, i) => (
                    <div key={i} className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {e.degree}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {e.institution}
                        </p>
                      </div>
                      {(e.graduationYear || e.graduationDate) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <Calendar size={11} />
                          {e.graduationYear ||
                            new Date(e.graduationDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <Section title="Certifications" icon={Award}>
                <div className="space-y-3">
                  {certifications.map((c, i) => (
                    <div key={i} className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {c.title}
                        </p>
                        {c.organization && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {c.organization}
                          </p>
                        )}
                      </div>
                      {c.dateEarned && (
                        <p className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(c.dateEarned).toLocaleDateString("en-NG", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <Section title="Projects" icon={Globe}>
                <div className="space-y-3">
                  {projects.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {p.title}
                        </p>
                        {p.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {p.description}
                          </p>
                        )}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lime-700 hover:text-lime-800 flex-shrink-0"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <div className="lg:w-72 xl:w-80 space-y-5 flex-shrink-0">
            {/* Hire CTA */}
            <div className="bg-primary-500 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Briefcase size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-1 text-sm">
                Interested in {fullName.split(" ")[0]}?
              </h3>
              <p className="text-primary-200 text-xs mb-4">
                Create an employer account to contact candidates.
              </p>
              <Link
                href="/signup"
                className="block w-full py-2.5 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Get in Touch
              </Link>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Role Applied", val: candidate.roleTitle },
                  { label: "Role Type", val: candidate.roleType },
                  {
                    label: "Preferred Location",
                    val: candidate.preferredLocation,
                  },
                  {
                    label: "Skills",
                    val: skills.length > 0 ? `${skills.length} listed` : null,
                  },
                  {
                    label: "Experience",
                    val:
                      workExp.length > 0
                        ? `${workExp.length} position${workExp.length > 1 ? "s" : ""}`
                        : null,
                  },
                  {
                    label: "Education",
                    val:
                      education.length > 0 ? education[0]?.institution : null,
                  },
                ]
                  .filter(({ val }) => val)
                  .map(({ label, val }) => (
                    <div key={label} className="text-sm">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                        {label}
                      </p>
                      <p className="text-gray-700 font-medium mt-0.5">{val}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Related applications */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  Other Candidates
                </h3>
                <div className="space-y-1">
                  {related.map((app) => (
                    <RelatedCard key={app._id} app={app} />
                  ))}
                </div>
                <Link
                  href="/find-candidates"
                  className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-xs text-lime-700 font-semibold"
                >
                  Browse all candidates <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
