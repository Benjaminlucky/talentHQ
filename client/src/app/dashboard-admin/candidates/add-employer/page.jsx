"use client";

import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const nigeriaStatesWithLGAs = {
  Lagos: ["Ikeja", "Surulere", "Epe", "Ikorodu"],
  FCT: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny"],
};

export default function EmployerSignup() {
  const authStatus = useSuperAdminAuthRedirect();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    state: "",
    lga: "",
    address: "",
    companyEmail: "",
    phoneNumber: "",
    website: "",
    linkedin: "",
    cacNumber: "",
    password: "",
    confirmPassword: "",
    logo: null,
    agreeToTerms: false,
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
  });

  const [logoFileName, setLogoFileName] = useState("");

  const password = formData.password;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strengthLevel = Object.values(requirements).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
      setLogoFileName(files[0]?.name || "");
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, lga: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const passwordValid = Object.values(requirements).every(Boolean);
    if (!passwordValid) {
      toast.error("Password must meet all strength requirements.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("You must agree to the terms and conditions.");
      setIsLoading(false);
      return;
    }

    const convertLogoToBase64 = () => {
      return new Promise((resolve, reject) => {
        if (!formData.logo) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(formData.logo);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    };

    try {
      const base64Logo = await convertLogoToBase64();

      const finalPayload = {
        ...formData,
        logo: base64Logo,
      };

      delete finalPayload.confirmPassword;

      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://talenthq-1.onrender.com"
          : "http://localhost:5000";

      const response = await fetch(`${baseUrl}/api/employers/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Signup successful! Redirecting to login...");
        setFormData({
          companyName: "",
          industry: "",
          companySize: "",
          state: "",
          lga: "",
          address: "",
          companyEmail: "",
          phoneNumber: "",
          website: "",
          linkedin: "",
          cacNumber: "",
          password: "",
          confirmPassword: "",
          logo: null,
          agreeToTerms: false,
          contactPersonName: "",
          contactPersonDesignation: "",
          contactPersonEmail: "",
          contactPersonPhone: "",
        });
        setLogoFileName("");

        setTimeout(() => {
          window.location.href = "/dashboard-admin";
        }, 3000);
      } else {
        toast.error(result.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
        <h2 className="text-3xl font-bold text-center text-lime-600 mb-10">
          Add Employer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Company Name"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          />

          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
            required
          >
            <option value="">Select Industry</option>
            <option value="tech">Technology</option>
            <option value="construction">Construction</option>
            <option value="finance">Finance</option>
            <option value="logistics">Logistics</option>
            <option value="others">Others</option>
          </select>

          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          >
            <option value="">Company Size</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201+">201 and above</option>
          </select>

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
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Company Address"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          />

          <input
            name="companyEmail"
            type="email"
            value={formData.companyEmail}
            onChange={handleChange}
            placeholder="Company Email"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          />

          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          />

          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Company Website"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="LinkedIn Page"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            name="cacNumber"
            value={formData.cacNumber}
            onChange={handleChange}
            placeholder="CAC Registration Number"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1 mt-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 rounded transition-all duration-300`}
                  style={{
                    width: `${(strengthLevel / 5) * 100}%`,
                    backgroundColor:
                      strengthLevel <= 2
                        ? "#ef4444" // red-500
                        : strengthLevel <= 4
                        ? "#facc15" // yellow-400
                        : "#22c55e", // green-500
                  }}
                />
                <span className="text-sm font-semibold text-gray-600"></span>
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
                    requirements.special ? "text-green-600" : "text-red-600"
                  }
                >
                  Special character
                </li>
              </ul>
            </div>
          )}

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Company Logo
            </label>
            <input
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-lime-50 file:text-lime-700
                hover:file:bg-lime-100"
            />
            {logoFileName && (
              <p className="text-sm mt-1 text-lime-700 font-semibold">
                Selected File: {logoFileName}
              </p>
            )}
          </div>

          {/* Contact Person Section */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg text-gray-700 mb-3">
              Contact Person
            </h3>

            <input
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full input font-bold text-gray-500 py-2 mb-4 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
              required
            />

            <select
              name="contactPersonDesignation"
              value={formData.contactPersonDesignation}
              onChange={handleChange}
              className="w-full input font-bold text-gray-500 py-2 px-2 border-2 mb-4 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
              required
            >
              <option value="">Designation</option>
              <option value="ceo">CEO</option>
              <option value="hr">HR Manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="supervisor">Supervisor</option>
              <option value="others">Others</option>
            </select>

            <input
              name="contactPersonEmail"
              type="email"
              value={formData.contactPersonEmail}
              onChange={handleChange}
              placeholder="Contact Email"
              className="w-full input font-bold text-gray-500 py-2 px-2 border-2 mb-4 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
              required
            />

            <input
              name="contactPersonPhone"
              value={formData.contactPersonPhone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 outline-none focus:ring-lime-600 focus:border-lime-600"
              required
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mr-2"
            />
            I agree to the terms and conditions
          </label>

          <button
            type="submit"
            className="w-full bg-lime-600 text-white p-3 rounded font-bold hover:bg-lime-700 flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? "Adding Employer..." : "Add a Employer"}
          </button>
        </form>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
}
