"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  MapPin,
  Phone,
  MessageSquare,
  Wrench,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Award,
  ChevronRight,
  Zap,
  Shield,
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
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex gap-6">
        <Sk className="w-28 h-28 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Sk className="h-7 w-48" />
          <Sk className="h-4 w-36" />
          <Sk className="h-4 w-28" />
          <div className="flex gap-2 mt-2">
            <Sk className="h-8 w-24 rounded-xl" />
            <Sk className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Sk className="h-40" />
          <Sk className="h-32" />
          <Sk className="h-64" />
        </div>
        <Sk className="h-80" />
      </div>
    </div>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────────
function ErrorState({ message }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Profile not found</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <Link
          href="/find-candidates"
          className="px-5 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition"
        >
          Browse Talent
        </Link>
      </div>
    </div>
  );
}

// ── Skill pill ────────────────────────────────────────────────────────────────
function SkillPill({ skill }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-100">
      <Wrench size={10} />
      {skill}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HandymanPublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messaging, setMessaging] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API}/api/handymen/${id}`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load profile"),
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
        { recipientId: id, recipientRole: "handyman" },
        { withCredentials: true },
      );
      router.push(`/dashboard/${user.role}/messages`);
    } catch {
      notify("Failed to start conversation", "error");
      setMessaging(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error || !data)
    return <ErrorState message={error || "This profile could not be found."} />;

  const { handyman } = data;
  const initials = (handyman.fullName || "H")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const skills = Array.isArray(handyman.skills)
    ? handyman.skills
    : handyman.skills
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

  const certifications = handyman.certifications
    ? handyman.certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-lime-600 text-white"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          {handyman.avatar ? (
            <img
              src={handyman.avatar}
              alt={handyman.fullName}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-100 flex-shrink-0"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-black text-gray-900">
                {handyman.fullName}
              </h1>
              {handyman.avgRating > 0 && (
                <StarRating
                  rating={handyman.avgRating}
                  count={handyman.reviewCount}
                  size={14}
                />
              )}
            </div>

            {/* Trade badge */}
            {handyman.trade && (
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-xl">
                  <Wrench size={13} />
                  {handyman.trade}
                </span>
                {handyman.yearsExperience > 0 && (
                  <span className="text-sm text-gray-500 font-medium">
                    {handyman.yearsExperience} yr
                    {handyman.yearsExperience !== 1 ? "s" : ""} experience
                  </span>
                )}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-4">
              {handyman.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {handyman.location}
                </span>
              )}
              {handyman.phone && (
                <a
                  href={`tel:${handyman.phone}`}
                  className="flex items-center gap-1.5 hover:text-amber-700 transition"
                >
                  <Phone size={13} className="text-gray-400" />
                  {handyman.phone}
                </a>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {handyman.whatsapp && (
                <a
                  href={`https://wa.me/${handyman.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl transition"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50"
              >
                <MessageSquare size={14} />
                {messaging ? "Opening…" : "Send Message"}
              </button>
              {handyman.phone && (
                <a
                  href={`tel:${handyman.phone}`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
                >
                  <Phone size={14} /> Call
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── MAIN ────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {handyman.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Zap size={15} className="text-amber-500" /> About
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {handyman.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench size={15} className="text-amber-500" /> Skills &
                Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <SkillPill key={i} skill={s} />
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={15} className="text-amber-500" /> Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-lime-600 flex-shrink-0"
                    />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <ReviewSection subjectModel="handyman" subjectId={id} />
          </div>
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-amber-500 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-amber-100 text-xs uppercase tracking-wide mb-4">
              At a Glance
            </h3>
            <div className="space-y-3">
              {handyman.trade && (
                <div className="flex items-center justify-between">
                  <span className="text-amber-200 text-sm">Trade</span>
                  <span className="font-bold text-sm text-right">
                    {handyman.trade}
                  </span>
                </div>
              )}
              {handyman.yearsExperience > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-amber-200 text-sm">Experience</span>
                  <span className="font-black text-xl">
                    {handyman.yearsExperience}
                    <span className="text-base font-semibold">
                      yr{handyman.yearsExperience !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>
              )}
              {handyman.avgRating > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-amber-200 text-sm">Rating</span>
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-white text-white" />
                    <span className="font-black text-xl">
                      {handyman.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              {handyman.reviewCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-amber-200 text-sm">Reviews</span>
                  <span className="font-black text-xl">
                    {handyman.reviewCount}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-amber-200 text-sm">Member since</span>
                <span className="font-semibold text-sm">
                  {new Date(handyman.createdAt).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Shield size={14} className="text-lime-600" /> Contact
            </h3>
            <div className="space-y-3">
              {handyman.phone && (
                <a
                  href={`tel:${handyman.phone}`}
                  className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-amber-700 transition"
                >
                  <Phone size={14} className="text-gray-400" />
                  {handyman.phone}
                </a>
              )}
              {handyman.whatsapp && (
                <a
                  href={`https://wa.me/${handyman.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-green-600 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 fill-green-500"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition disabled:opacity-50"
              >
                <MessageSquare size={14} />
                {user ? "Send Message" : "Log in to message"}
              </button>
            </div>
          </div>

          {/* Location */}
          {handyman.location && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-lime-600" /> Location
              </h3>
              <p className="text-sm text-gray-600">{handyman.location}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
