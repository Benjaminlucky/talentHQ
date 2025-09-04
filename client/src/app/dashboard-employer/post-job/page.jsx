"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import useEmployerAuthRedirect from "@/app/utils/employerAuthRedirect.js";

const JobPostForm = () => {
  const status = useEmployerAuthRedirect("employer"); // ✅ enforce employer auth

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    state: "",
    lga: "",
    address: "",
    phoneNumber: "",
    category: "",
    type: "Full-time",
    salary: "",
    experienceLevel: "",
    deadline: "",
    company: "", // ✅ FIXED: use `company` (not companyId)
    postedBy: "employer",
    jobFor: "professional",
    qualification: "",
    responsibilities: "",
    skills: "",
    benefits: "",
  });

  // ✅ auto-set company and postedBy from localStorage user
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.role === "employer") {
      setFormData((prev) => ({
        ...prev,
        postedBy: "employer",
        company: userData._id, // ✅ matches backend
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken"); // ✅ must match backend
      console.log("Using token:", accessToken);

      await axios.post("http://localhost:5000/api/jobs/", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ✅ correct usage
          "Content-Type": "application/json",
        },
      });

      toast.success("Job posted successfully");

      setFormData({
        title: "",
        description: "",
        qualification: "",
        responsibilities: "",
        skills: "",
        benefits: "",
        salary: "",
        experienceLevel: "",
        deadline: "",
        company: "", // ✅ reset
      });
    } catch (err) {
      console.error("Job post failed:", err);
      toast.error(err.response?.data?.message || "Error posting job");
    }
  };

  if (status === "checking")
    return <div className="p-6">Checking authentication...</div>;
  if (status === "unauthorized") return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 rounded-sm max-w-3xl mx-auto mt-8"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Post New Job
      </h2>

      {/* Title */}
      <input
        type="text"
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleChange}
        required
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Description */}
      <textarea
        name="description"
        placeholder="Job Description"
        value={formData.description}
        onChange={handleChange}
        required
        rows="4"
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Responsibilities */}
      <textarea
        name="responsibilities"
        placeholder="Responsibilities (comma separated)"
        value={formData.responsibilities}
        onChange={handleChange}
        rows="3"
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Qualification */}
      <input
        type="text"
        name="qualification"
        placeholder="Qualification (e.g. BSc. Computer Science)"
        value={formData.qualification}
        onChange={handleChange}
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Skills */}
      <input
        type="text"
        name="skills"
        placeholder="Skills (comma separated)"
        value={formData.skills}
        onChange={handleChange}
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Benefits */}
      <input
        type="text"
        name="benefits"
        placeholder="Benefits (comma separated)"
        value={formData.benefits}
        onChange={handleChange}
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Address / Contact */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="location"
          placeholder="City"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
        <input
          type="text"
          name="lga"
          placeholder="LGA"
          value={formData.lga}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
        <input
          type="text"
          name="address"
          placeholder="Full Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Contact Phone"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
        <input
          type="text"
          name="category"
          placeholder="Job Category (e.g. Plumbing, Tech, etc)"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
      </div>

      {/* Job Type / For */}
      <div className="grid grid-cols-2 gap-4">
        <select
          name="jobFor"
          value={formData.jobFor}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        >
          <option value="professional">White Collar</option>
          <option value="handyman">Handyman</option>
        </select>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      {/* Salary & Experience */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="salary"
          placeholder="Salary Range"
          value={formData.salary}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
        <input
          type="text"
          name="experienceLevel"
          placeholder="Experience (e.g. 2-4 Years)"
          value={formData.experienceLevel}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3"
        />
      </div>

      {/* Deadline */}
      <input
        type="date"
        name="deadline"
        value={formData.deadline}
        onChange={handleChange}
        className="w-full border border-gray-400 rounded-sm px-4 py-3"
      />

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-lime-500 text-white py-2 px-4 rounded-sm hover:bg-lime-700 transition duration-200"
      >
        Post Job
      </button>

      <ToastContainer position="top-right" autoClose={3000} />
    </form>
  );
};

export default JobPostForm;
