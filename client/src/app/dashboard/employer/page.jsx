"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ClipboardList, CheckCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/employer/jobs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce(
    (acc, job) => acc + (job.applicants?.length || 0),
    0
  );
  const hires = jobs.filter((j) => j.status === "filled").length;

  const chartData = jobs.slice(-6).map((job) => ({
    name: job.title,
    applicants: job.applicants?.length || 0,
  }));

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user?.fullName} 🏢</h1>
          <p className="text-gray-600">
            Manage your job postings and applicants easily.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <ClipboardList className="w-10 h-10 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Jobs Posted</p>
                <p className="text-xl font-bold">{totalJobs}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="w-10 h-10 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Applicants</p>
                <p className="text-xl font-bold">{totalApplicants}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Successful Hires</p>
                <p className="text-xl font-bold">{hires}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Recent Jobs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Applicants per Job</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="applicants"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Job Posts</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-gray-500">No jobs posted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <li
                      key={job._id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">
                          {job.applicants?.length || 0} applicants
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.status === "filled"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
