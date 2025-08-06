"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";
import "react-toastify/dist/ReactToastify.css";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";

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

export default function HandySignup() {
  const authStatus = useSuperAdminAuthRedirect();
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

  const [loading, setLoading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const router = useRouter();

  const password = formData.password;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strengthLevel = Object.values(requirements).filter(Boolean).length;
  const strengthLabel =
    strengthLevel <= 2 ? "Weak" : strengthLevel <= 4 ? "Fair" : "Strong";
  const strengthColor =
    strengthLevel <= 2
      ? "bg-red-500"
      : strengthLevel <= 4
      ? "bg-yellow-500"
      : "bg-green-500";

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
      setResumeFileName(files[0]?.name || "");
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
    let updatedTypes = [...formData.jobType];
    if (checked) {
      updatedTypes.push(value);
    } else {
      updatedTypes = updatedTypes.filter((type) => type !== value);
    }
    setFormData({ ...formData, jobType: updatedTypes });
  };

  const trimFormData = (data) => {
    const trimmed = {};
    for (const key in data) {
      if (typeof data[key] === "string") {
        trimmed[key] = data[key].trim();
      } else {
        trimmed[key] = data[key];
      }
    }
    return trimmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = trimFormData(formData);

    const passwordValid = Object.values(requirements).every(Boolean);
    if (trimmed.password !== trimmed.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!passwordValid) {
      toast.error("Password must meet all strength requirements.");
      return;
    }

    if (!trimmed.agreeToTerms) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    const formPayload = new FormData();
    for (const key in trimmed) {
      if (key === "jobType") {
        trimmed.jobType.forEach((type) =>
          formPayload.append("jobType[]", type)
        );
      } else if (key === "skills") {
        trimmed.skills
          .split(",")
          .map((s) => s.trim())
          .forEach((skill) => formPayload.append("skills[]", skill));
      } else if (key === "expectedSalary") {
        formPayload.append(key, Number(trimmed[key]));
      } else if (key === "resume" && formData.resume) {
        formPayload.append("resume", formData.resume);
      } else {
        formPayload.append(key, trimmed[key]);
      }
    }

    try {
      setLoading(true);

      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://talenthq-1.onrender.com"
          : "http://localhost:5000";

      const response = await fetch(`${baseUrl}/api/handyman/signup`, {
        method: "POST",
        body: formPayload,
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Signup successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });

        setTimeout(() => {
          router.push("/dashboard-admin");
        }, 3000);
      } else {
        toast.error(result.message || "Signup failed.", {
          position: "top-center",
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again later.", {
        position: "top-center",
        theme: "colored",
      });
      setLoading(false);
    }
  };

  const states = Object.keys(nigeriaStatesWithLGAs);
  const lgas = formData.state ? nigeriaStatesWithLGAs[formData.state] : [];

  if (authStatus !== "authorized") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4">
      <div className="max-w-3xl w-full rounded-lg p-2">
        <h2 className="text-3xl font-bold text-center text-lime-600 mb-12">
          Add Handyman
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            required
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp Number"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            required
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-full rounded ${strengthColor}`} />
                <span className="text-sm font-semibold text-gray-600">
                  {strengthLabel}
                </span>
              </div>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                <li
                  className={
                    requirements.length ? "text-green-600" : "text-red-600"
                  }
                >
                  At least 8 characters
                </li>
                <li
                  className={
                    requirements.uppercase ? "text-green-600" : "text-red-600"
                  }
                >
                  Uppercase letter
                </li>
                <li
                  className={
                    requirements.lowercase ? "text-green-600" : "text-red-600"
                  }
                >
                  Lowercase letter
                </li>
                <li
                  className={
                    requirements.number ? "text-green-600" : "text-red-600"
                  }
                >
                  Number
                </li>
                <li
                  className={
                    requirements.specialChar ? "text-green-600" : "text-red-600"
                  }
                >
                  Special character
                </li>
              </ul>
            </div>
          )}

          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            type="password"
            required
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {formData.state && (
            <select
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
              required
            >
              <option value="">Select LGA</option>
              {lgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          )}

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Exact Address"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="jobCategory"
            value={formData.jobCategory}
            onChange={handleChange}
            placeholder="Job Category (e.g. electrician)"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          >
            <option value="">Experience Level</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>

          <select
            name="currentStatus"
            value={formData.currentStatus}
            onChange={handleChange}
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          >
            <option value="">Current Status</option>
            <option value="employed">Employed</option>
            <option value="freelancer">Freelancer</option>
            <option value="unemployed">Unemployed</option>
          </select>

          <input
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="LinkedIn Profile"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="Portfolio URL"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <div>
            <p className="font-semibold">Job Type</p>
            {["full-time", "part-time", "contract", "internship"].map(
              (type) => (
                <label key={type} className="block">
                  <input
                    type="checkbox"
                    value={type}
                    checked={formData.jobType.includes(type)}
                    onChange={handleJobTypeChange}
                    className="mr-2"
                  />
                  {type}
                </label>
              )
            )}
          </div>

          <input
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            placeholder="Expected Salary"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Skills"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <textarea
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Education"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <textarea
            name="workSummary"
            value={formData.workSummary}
            onChange={handleChange}
            placeholder="Summarize Work Experience"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

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
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-lime-600 text-white p-3 rounded font-bold hover:bg-lime-700 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <ImSpinner2 className="animate-spin" />
                Adding Handyman...
              </>
            ) : (
              "Add Handyman"
            )}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
