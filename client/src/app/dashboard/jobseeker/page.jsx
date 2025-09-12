"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText } from "lucide-react";

export default function JobSeekerDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.fullName} 👋</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-600">
                <Briefcase className="h-5 w-5" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12 Active</p>
              <p className="text-sm text-gray-500">Jobs you’ve applied for</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-600">
                <FileText className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-gray-500">Profile completeness</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
