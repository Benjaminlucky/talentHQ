"use client";
export const dynamic = "force-dynamic"; // ✅ disable prerendering for auth-dependent page

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null); // "success" | "error"

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
    const lowercaseFields = ["roleType", "preferredLocation", "portfolioLinks"];

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

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setDeleteStatus(null);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/applications/${id}`,
        { withCredentials: true }
      );
      setDeleteStatus("success");
      toast.success("Application deleted");
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      console.error(err);
      setDeleteStatus("error");
      toast.error("Failed to delete application");
    } finally {
      setDeletingId(null);
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
            <div
              key={app._id}
              className="p-3 border rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-bold">{app.roleTitle}</p>
                <p className="text-gray-500">{app.roleType}</p>
                <p className="italic">{app.coverLetter}</p>
                <p className="text-sm text-gray-400">
                  Status: {app.status} • Applied:{" "}
                  {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Delete Confirmation Modal */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  asChild
                  className="bg-white/90 backdrop-blur-md border"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete this application?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        remove your application for <b>{app.roleTitle}</b>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Animated success/error feedback */}
                    <AnimatePresence>
                      {deleteStatus === "success" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 text-green-600 mt-2"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Application deleted successfully</span>
                        </motion.div>
                      )}
                      {deleteStatus === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 text-red-600 mt-2"
                        >
                          <XCircle className="h-5 w-5" />
                          <span>Failed to delete application</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDelete(app._id)}
                        disabled={deletingId === app._id}
                      >
                        {deletingId === app._id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </motion.div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
