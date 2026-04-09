"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ReachUsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.category) errs.category = "Please select a category";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 20)
      errs.message = "Please provide more detail (min 20 characters)";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/contact`, form);
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Failed to send message. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-lime-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Message Received!
          </h2>
          <p className="text-gray-500 mb-6">
            Thank you for reaching out. Our team will review your message and
            respond within <strong>24 business hours</strong>.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                name: "",
                email: "",
                phone: "",
                subject: "",
                category: "",
                message: "",
              });
            }}
            className="text-lime-600 underline text-sm hover:text-lime-700"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Get in Touch
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Have a question, partnership inquiry, or need support? We'd love to
          hear from you. Our team typically responds within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              {[
                {
                  Icon: Mail,
                  label: "Email",
                  value: "hello@talenthq.buzz",
                  href: "mailto:hello@talenthq.buzz",
                },
                {
                  Icon: Phone,
                  label: "Phone / WhatsApp",
                  value: "+234 805 364 2425",
                  href: "tel:+2348053642425",
                },
                {
                  Icon: MapPin,
                  label: "Address",
                  value: "Lagos, Nigeria",
                  href: null,
                },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-lime-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-lime-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm text-gray-700 hover:text-lime-600 transition"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-lime-50 border border-lime-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-lime-800 mb-1">
              Response Time
            </p>
            <p className="text-xs text-lime-700">
              Mon–Fri: within 4 hours
              <br />
              Weekends: within 24 hours
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Common Topics
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              {[
                "Account issues or login problems",
                "Job posting or application help",
                "Billing and subscription",
                "Partnership and advertising",
                "Report a fraudulent listing",
                "General feedback",
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-lime-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Send us a Message
          </h3>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="0805 364 2425"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass("phone")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass("category") + " bg-white"}
                >
                  <option value="">Select a category</option>
                  <option value="account_support">Account Support</option>
                  <option value="job_posting">Job Posting Help</option>
                  <option value="application_help">Application Help</option>
                  <option value="billing">Billing / Subscription</option>
                  <option value="partnership">Partnership / Advertising</option>
                  <option value="report_fraud">Report Fraud / Abuse</option>
                  <option value="feedback">General Feedback</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                name="subject"
                type="text"
                placeholder="Brief summary of your inquiry"
                value={form.subject}
                onChange={handleChange}
                className={inputClass("subject")}
                maxLength={150}
              />
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                rows={5}
                placeholder="Describe your issue or question in detail..."
                value={form.message}
                onChange={handleChange}
                className={inputClass("message") + " resize-none"}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.message ? (
                  <p className="text-xs text-red-500">{errors.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">
                  {form.message.length}/2000
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-lime-600 hover:bg-lime-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By submitting this form you agree to our{" "}
              <a
                href="/privacy-policy"
                className="underline hover:text-gray-600"
              >
                Privacy Policy
              </a>
              . We'll never share your data with third parties.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
