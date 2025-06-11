"use client";

import { useState } from "react";

const nigeriaStatesWithLGAs = {
  Lagos: ["Ikeja", "Surulere", "Epe", "Ikorodu"],
  FCT: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny"],
};

export default function EmployerSignup() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const states = Object.keys(nigeriaStatesWithLGAs);
  const lgas = formData.state ? nigeriaStatesWithLGAs[formData.state] : [];

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4">
      <div className="max-w-3xl w-full rounded-lg p-2">
        <h2 className="text-3xl font-bold text-center text-lime-600 mb-10">
          Employer Signup
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
            className="w-full bg-lime-600 text-white p-3 rounded font-bold hover:bg-lime-700"
          >
            Register Company
          </button>
        </form>
      </div>
    </div>
  );
}
