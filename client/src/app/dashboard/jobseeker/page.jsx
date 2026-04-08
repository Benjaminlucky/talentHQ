"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import axios from "axios";
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

// Skeleton loader for stat cards
function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white p-6 space-y-3">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-8 w-16 bg-gray-200 rounded" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
  );
}

// Compute profile completion from profile data
function computeCompletion(profile) {
  if (!profile) return 0;
  const checks = [
    !!profile.headline,
    !!profile.phone,
    !!profile.location?.city ||
      (typeof profile.location === "string" && profile.location),
    !!profile.resume,
    !!profile.avatar,
    (profile.skills?.length || profile.skill?.length || 0) > 0,
    (profile.workExperience?.length || 0) > 0,
    (profile.education?.length || 0) > 0,
    !!profile.linkedin,
    !!profile.tagline,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function completionLabel(pct) {
  if (pct < 40) return { text: "Needs attention", color: "text-red-600" };
  if (pct < 70) return { text: "Getting there", color: "text-orange-500" };
  if (pct < 90) return { text: "Looking good!", color: "text-blue-600" };
  return { text: "Complete!", color: "text-lime-600" };
}

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-blue-100 text-blue-700",
  accepted: "bg-lime-100 text-lime-700",
  rejected: "bg-red-100 text-red-700",
};

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me`, {
            withCredentials: true,
          }),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/applications`,
            { withCredentials: true },
          ),
        ]);

        const profileData = profileRes.data;
        const apps = appsRes.data || [];

        setProfile(profileData);
        setRecentApps(apps.slice(0, 5)); // Show last 5

        // Compute stats from real data
        setStats({
          total: apps.length,
          pending: apps.filter((a) => a.status === "pending").length,
          accepted: apps.filter((a) => a.status === "accepted").length,
          rejected: apps.filter((a) => a.status === "rejected").length,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Set safe defaults so UI doesn't break
        setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
        setProfile(null);
        setRecentApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const completion = computeCompletion(profile);
  const { text: completionText, color: completionColor } =
    completionLabel(completion);

  // What's missing from the profile
  const missingItems = [];
  if (profile) {
    if (!profile.headline) missingItems.push("Professional headline");
    if (!profile.resume) missingItems.push("Resume / CV");
    if (!profile.avatar) missingItems.push("Profile photo");
    if (!(profile.skills?.length || profile.skill?.length))
      missingItems.push("Skills");
    if (!profile.workExperience?.length) missingItems.push("Work experience");
    if (!profile.education?.length) missingItems.push("Education");
  }

  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's a summary of your job search activity.
          </p>
        </div>

        {/* Profile completion banner */}
        {!loading && completion < 80 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Complete your profile to get noticed by employers
              </p>
              {missingItems.length > 0 && (
                <p className="text-xs text-amber-700 mt-0.5">
                  Missing: {missingItems.slice(0, 3).join(", ")}
                  {missingItems.length > 3 &&
                    ` +${missingItems.length - 3} more`}
                </p>
              )}
            </div>
            <Link href="/dashboard/jobseeker/profile">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
              >
                Update Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <Card className="rounded-2xl shadow-sm border hover:shadow-md transition">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border hover:shadow-md transition">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pending}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border hover:shadow-md transition">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-lime-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.accepted}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border hover:shadow-md transition">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Rejected
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.rejected}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile completion card */}
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-lime-600" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded-full" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`font-semibold ${completionColor}`}>
                        {completion}% — {completionText}
                      </span>
                    </div>
                    <Progress value={completion} className="h-2" />
                  </div>

                  {missingItems.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Still missing:
                      </p>
                      {missingItems.slice(0, 4).map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-1.5 text-xs text-gray-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                  <Link href="/dashboard/jobseeker/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-lime-700 border-lime-300 hover:bg-lime-50"
                    >
                      {completion >= 80 ? "View Profile" : "Complete Profile"}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent applications */}
          <Card className="lg:col-span-2 rounded-2xl shadow-sm border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Recent Applications
              </CardTitle>
              <Link href="/dashboard/jobseeker/applications">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500"
                >
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3"
                    >
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-40 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </div>
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentApps.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">
                    No applications yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">
                    Start applying for roles to track them here
                  </p>
                  <Link href="/findjob">
                    <Button
                      size="sm"
                      className="bg-lime-600 hover:bg-lime-700 text-white"
                    >
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApps.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {app.roleTitle}
                        </p>
                        <p className="text-xs text-gray-400">
                          {app.roleType} •{" "}
                          {new Date(app.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                          STATUS_STYLES[app.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Find Jobs",
                href: "/findjob",
                color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
              },
              {
                label: "My Applications",
                href: "/dashboard/jobseeker/applications",
                color: "bg-lime-50 text-lime-700 hover:bg-lime-100",
              },
              {
                label: "Update Profile",
                href: "/dashboard/jobseeker/profile",
                color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
              },
              {
                label: "Browse Candidates",
                href: "/find-candidates",
                color: "bg-orange-50 text-orange-700 hover:bg-orange-100",
              },
            ].map(({ label, href, color }) => (
              <Link key={label} href={href}>
                <div
                  className={`rounded-xl p-4 text-center text-sm font-medium cursor-pointer transition ${color}`}
                >
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
