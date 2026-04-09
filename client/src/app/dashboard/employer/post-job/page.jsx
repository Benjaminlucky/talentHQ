"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Tag,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Phone,
  Building2,
  Wrench,
  Clock,
  Info,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Technology",
  "Finance",
  "Marketing",
  "Design",
  "Sales",
  "Healthcare",
  "Engineering",
  "Education",
  "Administration",
  "Accounting",
  "Legal",
  "Operations",
  "Human Resources",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Tiling",
  "Welding",
  "Masonry",
  "AC Repair",
  "Generator Repair",
  "Other",
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const EXPERIENCE_LEVELS = [
  "No experience required",
  "0–1 year",
  "1–2 years",
  "2–4 years",
  "4–6 years",
  "6–10 years",
  "10+ years",
];

// ── Field helpers ─────────────────────────────────────────────────────────────
const INP =
  "w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition";
const SEL = `${INP} cursor-pointer appearance-none`;

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
    <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
      <Icon size={15} className="text-lime-600" />
      {title}
    </h2>
    {children}
  </div>
);

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ job, onPostAnother }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-lime-50 rounded-2xl flex items-center justify-center mb-5">
        <CheckCircle2 size={40} className="text-lime-600" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Job Posted!</h2>
      <p className="text-gray-500 text-sm mb-1">
        <strong className="text-gray-800">{job.title}</strong> is now live and
        visible to candidates.
      </p>
      <p className="text-xs text-gray-400 mb-8">
        Applications will appear in your pipeline as candidates apply.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={() => router.push("/dashboard/employer/applications")}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors"
        >
          View Applications <ChevronRight size={15} />
        </button>
        <button
          onClick={onPostAnother}
          className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Post Another Job
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const INIT = {
  title: "",
  description: "",
  responsibilities: "",
  qualification: "",
  skills: "",
  benefits: "",
  location: "",
  state: "",
  lga: "",
  address: "",
  phoneNumber: "",
  category: "",
  type: "Full-time",
  jobFor: "professional",
  salary: "",
  experienceLevel: "",
  deadline: "",
};

export default function PostJobPage() {
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postedJob, setPostedJob] = useState(null);

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const validate = () => {
    if (!form.title.trim()) return "Job title is required";
    if (!form.description.trim()) return "Description is required";
    if (form.description.trim().length < 50)
      return "Description must be at least 50 characters";
    if (!form.location.trim()) return "City / Location is required";
    if (!form.state) return "State is required";
    if (!form.category) return "Category is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/jobs`, form, {
        withCredentials: true,
      });
      setPostedJob(res.data.job);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to post job. Please try again.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="max-w-4xl space-y-6">
        {postedJob ? (
          <SuccessScreen
            job={postedJob}
            onPostAnother={() => {
              setPostedJob(null);
              setForm(INIT);
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div>
              <h1 className="text-2xl font-black text-gray-900">Post a Job</h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details below. Fields marked{" "}
                <span className="text-red-500">*</span> are required.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Job Basics */}
              <Section title="Job Details" icon={Briefcase}>
                <Field label="Job Title" required>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior React Developer, Plumber, Electrician"
                    className={INP}
                    maxLength={100}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Who is this for?" required>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          val: "professional",
                          label: "White Collar",
                          icon: Briefcase,
                        },
                        {
                          val: "handyman",
                          label: "Handyman / Trade",
                          icon: Wrench,
                        },
                      ].map(({ val, label, icon: Icon }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => set("jobFor", val)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                            form.jobFor === val
                              ? "border-lime-500 bg-lime-50 text-lime-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="space-y-5">
                    <Field label="Job Type" required>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className={SEL}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </Field>
                    <Field label="Category" required>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={SEL}
                      >
                        <option value="">Select a category…</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>

                <Field
                  label="Job Description"
                  required
                  hint="Minimum 50 characters. Describe the role, team, and what makes it exciting."
                >
                  <textarea
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the role, team, company culture, and what the candidate will be doing day-to-day..."
                    className={`${INP} resize-none`}
                    maxLength={3000}
                  />
                  <p className="text-right text-xs text-gray-400">
                    {form.description.length}/3000
                  </p>
                </Field>

                <Field
                  label="Key Responsibilities"
                  hint="Comma-separated. e.g. Build UI components, Write unit tests, Review code"
                >
                  <textarea
                    name="responsibilities"
                    rows={3}
                    value={form.responsibilities}
                    onChange={handleChange}
                    placeholder="Lead product development, Manage a team of 5 engineers, Conduct code reviews..."
                    className={`${INP} resize-none`}
                  />
                </Field>

                <Field
                  label="Qualifications"
                  hint="What does the ideal candidate have?"
                >
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. BSc. Computer Science or equivalent, 3+ years experience"
                    className={INP}
                  />
                </Field>
              </Section>

              {/* Skills & Compensation */}
              <Section title="Skills & Compensation" icon={DollarSign}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Required Skills" hint="Comma-separated">
                    <input
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, MongoDB, TypeScript"
                      className={INP}
                    />
                  </Field>
                  <Field label="Benefits" hint="Comma-separated">
                    <input
                      name="benefits"
                      value={form.benefits}
                      onChange={handleChange}
                      placeholder="Health insurance, Remote work, Annual bonus"
                      className={INP}
                    />
                  </Field>
                  <Field label="Salary / Compensation" hint="Monthly or range">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                        ₦
                      </span>
                      <input
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        placeholder="150,000 – 300,000 / month"
                        className={`${INP} pl-8`}
                      />
                    </div>
                  </Field>
                  <Field label="Experience Level">
                    <select
                      name="experienceLevel"
                      value={form.experienceLevel}
                      onChange={handleChange}
                      className={SEL}
                    >
                      <option value="">Select experience…</option>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Section>

              {/* Location */}
              <Section title="Location & Contact" icon={MapPin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="City / Area" required>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Victoria Island, Lagos"
                      className={INP}
                    />
                  </Field>
                  <Field label="State" required>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={SEL}
                    >
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="LGA">
                    <input
                      name="lga"
                      value={form.lga}
                      onChange={handleChange}
                      placeholder="Local Government Area"
                      className={INP}
                    />
                  </Field>
                  <Field label="Full Address">
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address (optional)"
                      className={INP}
                    />
                  </Field>
                  <Field
                    label="Contact Phone"
                    hint="Candidates may use this to call directly"
                  >
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="08012345678"
                        className={`${INP} pl-9`}
                      />
                    </div>
                  </Field>
                  <Field label="Application Deadline">
                    <div className="relative">
                      <Calendar
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        name="deadline"
                        value={form.deadline}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`${INP} pl-9`}
                      />
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Preview card */}
              {form.title && (
                <div className="bg-primary-500 rounded-2xl p-5 text-white">
                  <p className="text-xs text-primary-200 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Info size={12} /> Preview — how this will appear to
                    candidates
                  </p>
                  <h3 className="font-black text-lg">{form.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-primary-200">
                    {form.type && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {form.type}
                      </span>
                    )}
                    {(form.location || form.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {[form.location, form.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {form.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />₦{form.salary}
                      </span>
                    )}
                    {form.category && (
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {form.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        form.jobFor === "handyman"
                          ? "bg-amber-400 text-amber-900"
                          : "bg-lime-400 text-lime-900"
                      }`}
                    >
                      {form.jobFor === "handyman"
                        ? "Handyman / Trade"
                        : "Professional"}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pb-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-2xl text-base transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Posting
                      job…
                    </>
                  ) : (
                    <>
                      <Briefcase size={18} /> Post Job Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
