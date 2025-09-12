"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function OnboardingForm({ role }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    phone: "",
    whatsapp: "",
    jobCategory: "",
    experienceLevel: "",
    skills: "",
    education: "",
    workSummary: "",
    resume: null,
    trade: "",
    yearsExperience: "",
    certifications: "",
    companyName: "",
    companySize: "",
    industry: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "resume" && formData[key] !== "") {
          uploadData.append(key, formData[key]);
        }
      });

      if (formData.resume instanceof File) {
        uploadData.append("resume", formData.resume);
      }

      // ✅ Dynamic API endpoint based on role
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE}/api/onboarding/${role}`;

      const res = await axios.patch(endpoint, uploadData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Update user in localStorage
      const updatedUser = { ...res.data.user, role };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Onboarding completed!");
      window.location.href = `/dashboard/${role}`;
    } catch (err) {
      toast.error(err.response?.data?.message || "Error completing onboarding");
    } finally {
      setLoading(false);
    }
  };

  const stepsTotal = role === "jobseeker" ? 3 : 2;
  const progress = (step / stepsTotal) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-lime-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: shared */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="w-full border p-2 rounded"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp Number"
              className="w-full border p-2 rounded"
              value={formData.whatsapp}
              onChange={handleChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location (City, Country)"
              className="w-full border p-2 rounded"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* STEP 2: role-specific */}
        {step === 2 && role === "jobseeker" && (
          <>
            <h2 className="text-xl font-bold mb-4">Career Information</h2>
            <select
              name="jobCategory"
              className="w-full border p-2 rounded"
              value={formData.jobCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Job Category</option>
              <option value="tech">Tech</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
            </select>
            <select
              name="experienceLevel"
              className="w-full border p-2 rounded"
              value={formData.experienceLevel}
              onChange={handleChange}
              required
            >
              <option value="">Experience Level</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated)"
              className="w-full border p-2 rounded"
              value={formData.skills}
              onChange={handleChange}
            />
            <input
              type="text"
              name="education"
              placeholder="Education"
              className="w-full border p-2 rounded"
              value={formData.education}
              onChange={handleChange}
            />
            <textarea
              name="workSummary"
              placeholder="Brief Work Summary"
              rows="3"
              className="w-full border p-2 rounded"
              value={formData.workSummary}
              onChange={handleChange}
            ></textarea>
          </>
        )}

        {step === 2 && role === "handyman" && (
          <>
            <h2 className="text-xl font-bold mb-4">Trade Information</h2>
            <input
              type="text"
              name="trade"
              placeholder="Trade (e.g., Electrician, Plumber)"
              className="w-full border p-2 rounded"
              value={formData.trade}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="yearsExperience"
              placeholder="Years of Experience"
              className="w-full border p-2 rounded"
              value={formData.yearsExperience}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="certifications"
              placeholder="Certifications (optional)"
              className="w-full border p-2 rounded"
              value={formData.certifications}
              onChange={handleChange}
            />
          </>
        )}

        {step === 2 && role === "employer" && (
          <>
            <h2 className="text-xl font-bold mb-4">Company Information</h2>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              className="w-full border p-2 rounded"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            <select
              name="companySize"
              className="w-full border p-2 rounded"
              value={formData.companySize}
              onChange={handleChange}
            >
              <option value="">Company Size</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201+">201+</option>
            </select>
            <input
              type="text"
              name="industry"
              placeholder="Industry"
              className="w-full border p-2 rounded"
              value={formData.industry}
              onChange={handleChange}
            />
          </>
        )}

        {/* STEP 3: resume for jobseeker */}
        {step === 3 && role === "jobseeker" && (
          <>
            <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
            <input
              type="file"
              name="resume"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  resume: e.target.files[0],
                }))
              }
            />
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
          )}

          {step < stepsTotal ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-lime-600 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-lime-600 text-white rounded"
            >
              {loading ? "Submitting..." : "Finish"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
