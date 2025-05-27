"use client";

import { useState } from "react";

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

  // Handle input changes
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
      setFormData((prev) => ({ ...prev, lga: "" })); // reset LGA when state changes
    }
  };

  // Handle jobType (checkbox multiple selection)
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

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your validation or API calls here
    console.log(formData);
  };

  const states = Object.keys(nigeriaStatesWithLGAs);
  const lgas = formData.state ? nigeriaStatesWithLGAs[formData.state] : [];

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4">
      <div className="max-w-3xl w-full  rounded-lg p-2">
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
              <option value="tech">Tech</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
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
            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              className="input font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
              onChange={handleChange}
            />
          </div>

          <textarea
            name="workSummary"
            rows="4"
            placeholder="Short Work Summary / Career Goals"
            className="input w-full font-bold text-gray-500 py-2 px-2 border-2 rounded-sm border-gray-300 focus:border-lime-600"
            onChange={handleChange}
          ></textarea>

          {/* Terms */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              required
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-lime-600"
            />
            <span className="text-sm">
              I agree to the{" "}
              <a href="#" className="underline text-lime-600">
                terms & conditions
              </a>
              .
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-lime-600 text-white py-3 font-semibold text-lg rounded hover:bg-lime-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
