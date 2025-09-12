"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: "",
    skills: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ new states for inline messages
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("error"); // "error" | "success"

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role,
      };

      if (role === "handyman") {
        payload.skills = formData.skills.split(",").map((s) => s.trim());
        payload.location = formData.location;
      }

      if (role === "employer") {
        payload.companyName = formData.companyName;
        payload.companyWebsite = formData.companyWebsite;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/signup2`,
        payload,
        { withCredentials: true }
      );

      setMessageType("success");
      setMessage("Signup successful! Redirecting...");

      // redirect after short delay so user sees the message
      setTimeout(() => {
        router.push(`/onboarding/${role}`);
      }, 800);
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              I want to sign up as:
            </h2>
            <div className="flex flex-col gap-4">
              {["jobseeker", "handyman", "employer"].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className="w-full border border-gray-300 py-3 rounded-lg hover:bg-lime-100 transition"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Sign up as {role}
            </h2>

            {/* ✅ Inline error/success message */}
            {message && (
              <div
                className={`p-2 mb-4 text-sm rounded ${
                  messageType === "error"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-green-100 text-green-700 border border-green-300"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />

              {/* Handyman extra fields */}
              {role === "handyman" && (
                <>
                  <input
                    type="text"
                    name="skills"
                    placeholder="Skills (comma separated)"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </>
              )}

              {/* Employer extra fields */}
              {role === "employer" && (
                <>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                  <input
                    type="text"
                    name="companyWebsite"
                    placeholder="Company Website"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-600 text-white py-2 rounded hover:bg-lime-700 disabled:opacity-50"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <button
              onClick={() => setStep(1)}
              className="mt-4 text-gray-500 text-sm underline"
            >
              ← Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
