"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Star, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HandymanDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/handyman/jobs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const completed = jobs.filter((j) => j.status === "completed").length;
  const earnings = jobs
    .filter((j) => j.status === "completed")
    .reduce((acc, job) => acc + (job.payment || 0), 0);
  const avgRating =
    jobs.reduce((acc, job) => acc + (job.rating || 0), 0) /
    (jobs.filter((j) => j.rating).length || 1);

  const chartData = jobs.slice(-6).map((job) => ({
    name: job.title,
    earnings: job.payment || 0,
  }));

  return (
    <ProtectedRoute allowedRoles={["handyman"]}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName} 👷‍♂️</h1>
          <p className="text-gray-600">Your handyman performance overview.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <Wrench className="w-10 h-10 text-lime-600" />
              <div>
                <p className="text-sm text-gray-500">Jobs Completed</p>
                <p className="text-xl font-bold">{completed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <DollarSign className="w-10 h-10 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold">${earnings}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <Star className="w-10 h-10 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-xl font-bold">{avgRating.toFixed(1)} ⭐</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Recent Jobs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Earnings from Last Jobs
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="earnings"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Jobs</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-gray-500">No jobs yet.</p>
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
                          {job.clientName}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.status === "completed"
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
