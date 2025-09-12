"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // ✅ inline message
  const [messageType, setMessageType] = useState("error"); // "error" | "success"
  const router = useRouter();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`,
        formData,
        { withCredentials: true }
      );

      const user = res.data.user;

      // update context + localStorage
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      setMessageType("success");
      setMessage("Login successful!");

      // Redirect by role after a short delay so user sees the message
      setTimeout(() => {
        switch (user.role) {
          case "jobseeker":
            router.push("/dashboard/jobseeker");
            break;
          case "handyman":
            router.push("/dashboard/handyman");
            break;
          case "employer":
            router.push("/dashboard/employer");
            break;
          case "admin":
            router.push("/dashboard/admin");
            break;
          default:
            router.push("/dashboard");
        }
      }, 800);
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-600 text-white py-2 rounded hover:bg-lime-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-lime-600 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
