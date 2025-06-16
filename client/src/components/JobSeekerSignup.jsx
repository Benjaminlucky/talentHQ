"use client";

import { useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import { ToastContainer, toast } from "react-toastify";

const nigeriaStatesWithLGAs = {
  Abia: ["Aba North", "Aba South", "Arochukwu", "Bende", "Isiala-Ngwa North"],
  Adamawa: ["Demsa", "Fufore", "Ganye", "Girei", "Gombi"],
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Somolu",
    "Surulere",
    "Bariga",
  ],
  FCT: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal"],
};

export default function JobSeekerSignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
    state: "",
    lga: "",
    location: "",
    jobCategory: "",
    experienceLevel: "",
    currentStatus: "",
    linkedin: "",
    portfolio: "",
    jobType: [],
    expectedSalary: "",
    skills: "",
    education: "",
    workSummary: "",
    resume: null,
    agreeToTerms: false,
  });
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, lga: "" }));
    }
  };

  const handleJobTypeChange = (e) => {
    const { value, checked } = e.target;
    let newJobType = [...formData.jobType];
    if (checked) {
      newJobType.push(value);
    } else {
      newJobType = newJobType.filter((item) => item !== value);
    }
    setFormData({ ...formData, jobType: newJobType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();
    for (const key in formData) {
      if (key === "jobType") {
        formData[key].forEach((type) => formPayload.append("jobType[]", type));
      } else {
        formPayload.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/jobseekers/signup",
        {
          method: "POST",
          body: formPayload,
        }
      );

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Signup successful! Redirecting to login page...");
        setTimeout(() => {
          window.location.href = "/jobseeker-signin"; // redirect to login page
        }, 3000);
      } else {
        toast.error(result.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again later.");
      setLoading(false);
    }
  };

  const states = Object.keys(nigeriaStatesWithLGAs);
  const lgas = formData.state ? nigeriaStatesWithLGAs[formData.state] : [];

  const jobCategories = [
    "Tech",
    "Marketing",
    "Finance",
    "Healthcare",
    "Legal",
    "Accounting",
    "Education",
    "Engineering",
    "Creative/Design",
    "Sales",
    "Administrative",
    "Others",
  ];

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4">
      <div className="max-w-3xl w-full rounded-lg p-2">
        <h2 className="text-3xl font-bold text-center text-lime-600 mb-12">
          Job Seeker Signup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="tel"
              name="whatsapp"
              placeholder="WhatsApp Number"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
          </div>

          {/* Location Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              disabled={!formData.state}
              required
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600 disabled:bg-gray-200"
            >
              <option value="">Select LGA</option>
              {lgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>

          {/* Career Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="location"
              placeholder="City, Country"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />

            <select
              name="jobCategory"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
              required
            >
              <option value="">Select Job Category</option>
              {jobCategories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>

            <select
              name="experienceLevel"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
              required
            >
              <option value="">Experience Level</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>

            <select
              name="currentStatus"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
              required
            >
              <option value="">Current Status</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Optional Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              name="linkedin"
              placeholder="LinkedIn Profile (optional)"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="url"
              name="portfolio"
              placeholder="Portfolio (optional)"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
          </div>

          {/* Job Type Multiple Checkbox */}
          <fieldset className="space-y-2">
            <legend className="font-semibold text-gray-700">
              Preferred Job Type(s)
            </legend>
            <div className="flex flex-wrap gap-4">
              {[
                "Full-time",
                "Part-time",
                "Contract",
                "Internship",
                "Remote",
              ].map((type) => (
                <label
                  key={type}
                  className="inline-flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="jobType"
                    value={type.toLowerCase()}
                    checked={formData.jobType.includes(type.toLowerCase())}
                    onChange={handleJobTypeChange}
                    className="form-checkbox h-5 w-5 text-lime-600"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* More Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="expectedSalary"
              placeholder="Expected Salary (₦ or $)"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="text"
              name="skills"
              placeholder="Key Skills (comma separated)"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <input
              type="text"
              name="education"
              placeholder="Highest Education Level"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
            <textarea
              name="workSummary"
              placeholder="Brief Work Summary"
              rows={4}
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            ></textarea>
          </div>
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Resume{" "}
              <span className="text-gray-400 text-xs">(PDF, DOC)</span>
            </label>
            <input
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-lime-50 file:text-lime-700
                hover:file:bg-lime-100"
            />
            {resumeFileName && (
              <p className="text-sm mt-1 text-lime-700 font-semibold">
                Selected File: {resumeFileName}
              </p>
            )}
          </div>

          <label className="flex items-center">
            <input
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mr-2"
            />
            I agree to the terms and conditions
          </label>

          <button
            type="submit"
            className="w-full bg-lime-600 text-white p-3 rounded font-bold hover:bg-lime-700 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <ImSpinner8 className="animate-spin text-white text-xl" />
                Signing you up...
              </>
            ) : (
              "Complete Signup"
            )}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
}
