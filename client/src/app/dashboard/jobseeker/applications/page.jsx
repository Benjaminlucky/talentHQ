"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/applications`,
        { withCredentials: true }
      );
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // fields you want always lowercase
    const lowercaseFields = [
      "roleType",
      //   "roleTitle",
      "preferredLocation",
      "portfolioLinks",
    ];

    setFormData((p) => ({
      ...p,
      [name]: lowercaseFields.includes(name) ? value.toLowerCase() : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/applications`,
        formData,
        { withCredentials: true }
      );
      toast.success("Application submitted!");
      setFormData({});
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Application Form */}
      <Card className="w-full lg:w-7/12 mx-auto">
        <CardHeader>
          <CardTitle>Apply for a Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="roleTitle"
            placeholder="Role Title (e.g. Frontend Developer)"
            value={formData.roleTitle || ""}
            onChange={handleChange}
          />
          <Input
            name="roleType"
            placeholder="Role Type (full-time, contract, internship)"
            value={formData.roleType || ""}
            onChange={handleChange}
          />
          <Input
            name="preferredLocation"
            placeholder="Preferred Location (Remote, Onsite)"
            value={formData.preferredLocation || ""}
            onChange={handleChange}
          />
          <Textarea
            name="coverLetter"
            placeholder="Cover Letter / Motivation"
            value={formData.coverLetter || ""}
            onChange={handleChange}
          />
          <Input
            name="portfolioLinks"
            placeholder="Portfolio Links (comma separated)"
            value={formData.portfolioLinks || ""}
            onChange={handleChange}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-lime-600 text-white"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="w-full lg:w-7/12 mx-auto">
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="p-3 border rounded-lg">
              <p className="font-bold">{app.roleTitle}</p>
              <p className="text-gray-500">{app.roleType}</p>
              <p className="italic">{app.coverLetter}</p>
              <p className="text-sm text-gray-400">
                Status: {app.status} • Applied:{" "}
                {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
