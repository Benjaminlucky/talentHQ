"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  MapPin,
  Globe,
  Linkedin,
  Phone,
  Mail,
  Users,
  Briefcase,
  Building2,
  Tag,
  DollarSign,
  Clock,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ReviewSection from "@/components/ReviewSection";
import StarRating from "@/components/StarRating";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-start gap-6">
          <Sk className="w-24 h-24 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Sk className="h-7 w-56" />
            <Sk className="h-4 w-40" />
            <Sk className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Sk className="h-48" />
          <Sk className="h-32" />
        </div>
        <Sk className="h-64" />
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Company not found</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <Link
          href="/findjob"
          className="px-5 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition"
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}

// ── Job card (compact) ────────────────────────────────────────────────────────
function JobCard({ job }) {
  const daysLeft = job.deadline
    ? Math.max(0, Math.ceil((new Date(job.deadline) - Date.now()) / 86400000))
    : null;
  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <Link
      href={`/findjob/${job._id}`}
      className="block p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">
            {job.title}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {job.location}
              </span>
            )}
            {job.type && (
              <span className="flex items-center gap-1">
                <Briefcase size={10} />
                {job.type}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1 text-lime-700 font-semibold">
                <DollarSign size={10} />₦{job.salary}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {job.category && (
              <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500 font-medium">
                {job.category}
              </span>
            )}
            {daysLeft !== null && (
              <span
                className={`text-[10px] font-semibold ${isExpired ? "text-red-400" : daysLeft < 5 ? "text-amber-500" : "text-gray-400"}`}
              >
                {isExpired ? "Expired" : `${daysLeft}d left`}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          size={15}
          className="text-gray-300 group-hover:text-primary-500 flex-shrink-0 mt-0.5 transition-colors"
        />
      </div>
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EmployerPublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API}/api/jobs/employer/${id}/profile`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Failed to load company profile",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessage = async () => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setMessaging(true);
    try {
      await axios.post(
        `${API}/api/messages/conversations`,
        { recipientId: id, recipientRole: "employer" },
        { withCredentials: true },
      );
      router.push(`/dashboard/${user.role}/messages`);
    } catch {
      setMessaging(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error || !data)
    return (
      <ErrorState
        message={error || "This company profile could not be found."}
      />
    );

  const { employer, jobs } = data;
  const companyInitials = (employer.companyName || employer.fullName || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Logo */}
          {employer.logo ? (
            <img
              src={employer.logo}
              alt={employer.companyName}
              className="w-24 h-24 rounded-2xl object-contain border border-gray-100 bg-gray-50 p-2 flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
              {companyInitials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-black text-gray-900">
                {employer.companyName || employer.fullName}
              </h1>
              {employer.avgRating > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarRating
                    rating={employer.avgRating}
                    count={employer.reviewCount}
                    size={14}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-4">
              {employer.industry && (
                <span className="flex items-center gap-1.5">
                  <Tag size={13} className="text-gray-400" />
                  {employer.industry}
                </span>
              )}
              {employer.companySize && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-400" />
                  {employer.companySize} employees
                </span>
              )}
              {employer.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {employer.location}
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {employer.companyWebsite && (
                <a
                  href={employer.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline px-3 py-1.5 bg-primary-50 rounded-xl border border-primary-100"
                >
                  <Globe size={12} /> Website
                </a>
              )}
              {employer.companyLinkedin && (
                <a
                  href={employer.companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100"
                >
                  <Linkedin size={12} /> LinkedIn
                </a>
              )}
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-primary-600 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 rounded-xl border border-gray-200 hover:border-primary-200 transition disabled:opacity-50"
              >
                <MessageSquare size={12} />
                {messaging ? "Opening…" : "Message"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Jobs + Reviews ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Open jobs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={16} className="text-lime-600" />
                Open Positions
                <span className="text-sm font-normal text-gray-400">
                  ({jobs.length})
                </span>
              </h2>
              {jobs.length > 0 && (
                <Link
                  href={`/findjob?company=${id}`}
                  className="text-xs text-lime-700 font-semibold hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={12} />
                </Link>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <Briefcase size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No open positions
                </p>
                <p className="text-xs text-gray-400">
                  This company has no active job listings right now.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <ReviewSection subjectModel="employer" subjectId={id} />
          </div>
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Company details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Building2 size={14} className="text-lime-600" /> Company Details
            </h3>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Industry", val: employer.industry },
                {
                  label: "Company size",
                  val:
                    employer.companySize && `${employer.companySize} employees`,
                },
                { label: "Location", val: employer.location },
                { label: "Contact name", val: employer.contactPersonName },
                {
                  label: "Designation",
                  val: employer.contactPersonDesignation,
                },
              ]
                .filter(({ val }) => val)
                .map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-gray-400 text-xs font-semibold uppercase tracking-wide flex-shrink-0 mt-0.5">
                      {label}
                    </dt>
                    <dd className="font-medium text-gray-800 text-xs text-right">
                      {val}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* Contact */}
          {(employer.phone || employer.email) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Contact</h3>
              <div className="space-y-2.5 text-sm">
                {employer.phone && (
                  <a
                    href={`tel:${employer.phone}`}
                    className="flex items-center gap-2.5 text-gray-700 hover:text-primary-600 transition"
                  >
                    <Phone size={13} className="text-gray-400" />
                    {employer.phone}
                  </a>
                )}
                {employer.email && (
                  <a
                    href={`mailto:${employer.email}`}
                    className="flex items-center gap-2.5 text-gray-700 hover:text-primary-600 transition truncate"
                  >
                    <Mail size={13} className="text-gray-400" />
                    {employer.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-primary-500 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-primary-100 text-xs uppercase tracking-wide mb-4">
              Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-sm">Open Jobs</span>
                <span className="font-black text-xl">{jobs.length}</span>
              </div>
              {employer.reviewCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-primary-200 text-sm">Reviews</span>
                  <span className="font-black text-xl">
                    {employer.reviewCount}
                  </span>
                </div>
              )}
              {employer.avgRating > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-primary-200 text-sm">Avg Rating</span>
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-neon-400 text-neon-400" />
                    <span className="font-black text-xl">
                      {employer.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-sm">Member since</span>
                <span className="font-semibold text-sm">
                  {new Date(employer.createdAt).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
