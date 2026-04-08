"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Users,
  Globe,
  Phone,
  ChevronRight,
  Tag,
} from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function SkeletonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <Sk className="h-40 w-full" />
          <Sk className="h-32 w-full" />
          <Sk className="h-48 w-full" />
          <Sk className="h-32 w-full" />
        </div>
        <div className="lg:w-80 space-y-4">
          <Sk className="h-64 w-full" />
          <Sk className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Tag Pill ─────────────────────────────────────────────────────────────────
const TagPill = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    lime: "bg-lime-50 text-lime-700 border border-lime-200",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
  };
  return (
    <span
      className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${colors[color]}`}
    >
      {children}
    </span>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6">
    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-lime-600" />}
      {title}
    </h2>
    {children}
  </div>
);

// ─── Related Job Card ─────────────────────────────────────────────────────────
function RelatedJobCard({ job }) {
  const companyName =
    job.company?.companyName || job.company?.fullName || "Company";
  return (
    <Link
      href={`/findjob/${job._id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
    >
      <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {companyName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-lime-700 transition-colors">
          {job.title}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {companyName} · {job.type}
        </p>
      </div>
      <ChevronRight
        size={14}
        className="text-gray-300 group-hover:text-lime-500 transition flex-shrink-0"
      />
    </Link>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs/${id}`,
        );
        setJob(res.data);

        // Related jobs by same company
        if (res.data?.company?._id) {
          try {
            const rel = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE}/api/jobs`,
              {
                params: { company: res.data.company._id, limit: 6 },
              },
            );
            setRelatedJobs((rel.data.jobs || []).filter((j) => j._id !== id));
          } catch {}
        }
      } catch (err) {
        setError(err.response?.data?.message || "Job not found");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <SkeletonPage />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link href="/findjob" className="text-sm text-lime-700 underline">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }
  if (!job) return null;

  const companyName =
    job.company?.companyName || job.company?.fullName || "Company";
  const responsibilities = job.responsibilities
    ? job.responsibilities
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];
  const skills = job.skills
    ? job.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const benefits = job.benefits
    ? job.benefits
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
    : [];

  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const daysLeft = deadlineDate
    ? Math.max(0, Math.ceil((deadlineDate - Date.now()) / 86400000))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft size={16} />
            Back to jobs
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href="/findjob" className="hover:text-gray-600">
              Jobs
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium truncate max-w-[160px]">
              {job.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Company logo */}
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={companyName}
                    className="w-16 h-16 rounded-xl object-contain border border-gray-100 bg-gray-50 p-1.5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {companyName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    <h1 className="text-2xl font-black text-gray-900 leading-tight flex-1">
                      {job.title}
                    </h1>
                    <TagPill color={job.type === "Full-time" ? "lime" : "blue"}>
                      {job.type}
                    </TagPill>
                  </div>

                  <p className="text-gray-600 font-semibold flex items-center gap-1.5 mb-4">
                    <Building2 size={14} className="text-gray-400" />
                    {companyName}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                    {job.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-lime-500" />
                        {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1.5 text-lime-700 font-semibold">
                        <DollarSign size={14} />
                        {job.salary}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400" />
                        {job.experienceLevel}
                      </span>
                    )}
                    {job.category && (
                      <span className="flex items-center gap-1.5">
                        <Tag size={14} className="text-gray-400" />
                        {job.category}
                      </span>
                    )}
                    {deadlineDate && (
                      <span
                        className={`flex items-center gap-1.5 ${daysLeft < 7 ? "text-red-600 font-semibold" : ""}`}
                      >
                        <Calendar size={14} />
                        Closes{" "}
                        {deadlineDate.toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {daysLeft !== null && daysLeft < 14 && (
                          <span className="ml-1 text-xs">
                            ({daysLeft}d left)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply button */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Apply for this role
                  <ChevronRight size={16} />
                </Link>
                {job.company?.companyWebsite && (
                  <a
                    href={job.company.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    <Globe size={15} />
                    Company site
                    <ExternalLink size={12} className="text-gray-400" />
                  </a>
                )}
              </div>
            </div>

            {/* About this role */}
            {job.description && (
              <Section title="About this Role" icon={Briefcase}>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </Section>
            )}

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <Section title="Key Responsibilities" icon={CheckCircle2}>
                <ul className="space-y-2.5">
                  {responsibilities.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-lime-500 mt-0.5 flex-shrink-0"
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Qualification */}
            {job.qualification && (
              <Section title="Qualifications" icon={Users}>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {job.qualification}
                </p>
              </Section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Section title="Required Skills" icon={Tag}>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <TagPill key={s} color="lime">
                      {s}
                    </TagPill>
                  ))}
                </div>
              </Section>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <Section title="What You'll Get" icon={CheckCircle2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {benefits.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-2.5 text-sm text-gray-700"
                    >
                      <span className="w-5 h-5 bg-lime-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={12} className="text-lime-600" />
                      </span>
                      {b}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Apply again at bottom */}
            <div className="bg-primary-500 rounded-2xl p-6 text-center">
              <h3 className="text-white font-bold text-lg mb-2">
                Interested in this role?
              </h3>
              <p className="text-primary-200 text-sm mb-4">
                Create a profile and apply in under 2 minutes.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Apply Now <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
          <div className="lg:w-80 xl:w-96 space-y-5 flex-shrink-0">
            {/* Quick details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">
                Job Details
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Briefcase, label: "Job Type", val: job.type },
                  { icon: MapPin, label: "Location", val: job.location },
                  { icon: DollarSign, label: "Salary", val: job.salary },
                  {
                    icon: Users,
                    label: "Experience",
                    val: job.experienceLevel,
                  },
                  { icon: Tag, label: "Category", val: job.category },
                  {
                    icon: Calendar,
                    label: "Deadline",
                    val: deadlineDate?.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  },
                ]
                  .filter(({ val }) => val)
                  .map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex items-start gap-3 text-sm">
                      <Icon
                        size={14}
                        className="text-lime-600 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="text-gray-700 font-medium mt-0.5">
                          {val}
                        </p>
                      </div>
                    </div>
                  ))}

                {job.phoneNumber && (
                  <div className="flex items-start gap-3 text-sm">
                    <Phone
                      size={14}
                      className="text-lime-600 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                        Contact
                      </p>
                      <a
                        href={`tel:${job.phoneNumber}`}
                        className="text-gray-700 font-medium mt-0.5 hover:text-lime-700"
                      >
                        {job.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About company */}
            {companyName !== "Company" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">
                  About the Company
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {companyName}
                    </p>
                    {job.company?.industry && (
                      <p className="text-xs text-gray-500">
                        {job.company.industry}
                      </p>
                    )}
                  </div>
                </div>
                {job.company?.companyWebsite && (
                  <a
                    href={job.company.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-lime-700 hover:underline flex items-center gap-1"
                  >
                    <Globe size={11} /> {job.company.companyWebsite}
                  </a>
                )}
              </div>
            )}

            {/* Related jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">
                  More from {companyName}
                </h3>
                <div className="space-y-1">
                  {relatedJobs.map((rj) => (
                    <RelatedJobCard key={rj._id} job={rj} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
