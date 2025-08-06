"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";

const JobPostForm = () => {
  const status = useSuperAdminAuthRedirect();
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
    companyId: "", // Required if admin is posting on behalf of a company
    postedBy: "admin", // Or "employer" based on role
    jobFor: "professional",
  });

  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/jobs/employers"); // ✅ corrected route
        setCompanies(res.data); // assuming the response is an array of employers
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/jobs/", formData);
      toast.success("Job posted successfully");
      setFormData({ ...formData, title: "", description: "" });
    } catch (err) {
      console.error("Job post failed:", err);
      toast.error("Error posting job");
    }
  };

  if (status === "checking") {
    return <div className="p-6">Checking authentication...</div>; // optional loading UI
  }

  if (status === "unauthorized") {
    return null; // already redirected
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6   rounded-sm max-w-3xl mx-auto mt-8"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Post New Job
      </h2>

      <input
        type="text"
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleChange}
        required
        className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
      />

      <textarea
        name="description"
        placeholder="Job Description"
        value={formData.description}
        onChange={handleChange}
        required
        rows="4"
        className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="location"
          placeholder="City"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
        <input
          type="text"
          name="lga"
          placeholder="LGA"
          value={formData.lga}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
        <input
          type="text"
          name="address"
          placeholder="Full Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Contact Phone"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
        <input
          type="text"
          name="category"
          placeholder="Job Category (e.g. Plumbing, Tech, etc)"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <select
          name="jobFor"
          value={formData.jobFor}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        >
          <option value="professional">White Collar</option>
          <option value="handyman">Handyman</option>
        </select>

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="salary"
          placeholder="Salary Range"
          value={formData.salary}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />

        <input
          type="text"
          name="experienceLevel"
          placeholder="Experience Level"
          value={formData.experienceLevel}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        />
      </div>

      <input
        type="date"
        name="deadline"
        value={formData.deadline}
        onChange={handleChange}
        className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
      />

      {formData.postedBy === "admin" && (
        <select
          name="companyId"
          value={formData.companyId}
          onChange={handleChange}
          required
          className="w-full border border-gray-400 rounded-sm px-4 py-3 focus:outline-none focus:ring-0 focus:ring-0"
        >
          <option value="">-- Select Company --</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.companyName}
            </option>
          ))}
        </select>
      )}

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
