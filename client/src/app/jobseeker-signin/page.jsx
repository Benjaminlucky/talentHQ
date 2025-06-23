"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export default function Page() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // use router for redirection

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/jobseekers/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        localStorage.setItem("accessToken", result.token);
        localStorage.setItem("refreshToken", result.refreshToken);

        toast.success("Login successful! Redirecting...", {
          position: "top-center",
          autoClose: 2500,
          hideProgressBar: false,
          pauseOnHover: false,
          theme: "colored",
        });

        // Redirect after short delay
        setTimeout(() => {
          router.push("/dashboard-jobseeker");
        }, 3000);
      } else {
        toast.error(
          result.message || "Login failed. Please check your credentials.",
          {
            position: "top-center",
            autoClose: 4000,
            theme: "colored",
          }
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again later.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-center text-lime-600 mb-10">
          Job Seeker Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g. johndoe@example.com"
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col relative">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500 pr-12 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-gray-500 hover:text-lime-600"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <ImSpinner2 className="animate-spin mr-2 text-lg" />
                Logging in...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
