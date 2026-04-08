"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  User,
  Briefcase,
  Building2,
  Wrench,
  FileText,
  Loader2,
} from "lucide-react";

// ─── Shared UI helpers ────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
        focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-400 transition ${className}`}
      {...props}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none
        focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition ${className}`}
      {...props}
    />
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total, labels }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const done = step > stepNum;
          const active = step === stepNum;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                  ${done ? "bg-lime-600 border-lime-600 text-white" : active ? "bg-white border-lime-600 text-lime-600" : "bg-white border-gray-300 text-gray-400"}`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${active ? "text-lime-700" : done ? "text-lime-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1.5 bg-gray-200 rounded-full mt-1">
        <div
          className="absolute left-0 top-0 h-full bg-lime-600 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── File upload button ───────────────────────────────────────────────────────
function FileUploadButton({ label, accept, file, onChange, hint }) {
  const ref = useRef();
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-lime-500 transition"
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
      <Upload className="mx-auto h-7 w-7 text-gray-400 mb-2" />
      <p className="text-sm font-medium text-gray-700">
        {file ? file.name : label}
      </p>
      {hint && !file && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {file && (
        <p className="text-xs text-lime-600 mt-1">
          ✓ File selected — click to change
        </p>
      )}
    </div>
  );
}

// ─── Nigeria states (sample — expand as needed) ───────────────────────────────
const NIGERIA_STATES = [
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
  "FCT - Abuja",
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

const JOB_CATEGORIES = [
  "Accounting / Finance",
  "Administration",
  "Agriculture",
  "Arts / Creative",
  "Customer Service",
  "Data / Analytics",
  "Design / UX",
  "Education / Training",
  "Engineering (Civil/Structural)",
  "Engineering (Software/IT)",
  "Healthcare",
  "Human Resources",
  "Legal",
  "Logistics / Supply Chain",
  "Management",
  "Manufacturing",
  "Marketing / PR",
  "Media / Communications",
  "Oil & Gas / Energy",
  "Operations",
  "Procurement",
  "Project Management",
  "Real Estate",
  "Research / Science",
  "Sales / Business Development",
  "Security",
  "Telecoms",
  "Transport / Driving",
  "Other",
];

const HANDYMAN_TRADES = [
  "Air Conditioning & Refrigeration",
  "Aluminium & Glass Work",
  "Bricklaying / Masonry",
  "Carpentry & Furniture",
  "CCTV & Security Systems",
  "Cleaning Services",
  "Electrical Installations",
  "Flooring & Tiling",
  "Generator Maintenance",
  "Interior Decoration",
  "Iron Work / Welding",
  "Painting & Screeding",
  "POP / Plastering",
  "Plumbing",
  "Roofing",
  "Solar Installation",
  "TV / Appliance Repair",
  "Water Treatment",
  "Other Trade",
];

const INDUSTRIES = [
  "Agriculture",
  "Aviation",
  "Banking / Finance",
  "Construction",
  "Education",
  "Energy / Oil & Gas",
  "FMCG / Retail",
  "Government / Public Sector",
  "Healthcare / Pharma",
  "Hospitality / Tourism",
  "IT / Technology",
  "Logistics / Transport",
  "Manufacturing",
  "Media / Entertainment",
  "NGO / Non-profit",
  "Real Estate",
  "Telecoms",
  "Other",
];

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateStep(role, step, data) {
  const errors = {};

  if (step === 1) {
    if (!data.phone?.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9+\s\-()]{7,15}$/.test(data.phone.trim()))
      errors.phone = "Enter a valid phone number";
    if (!data.state) errors.state = "State is required";
    if (!data.city?.trim()) errors.city = "City / area is required";
  }

  if (step === 2) {
    if (role === "jobseeker") {
      if (!data.jobCategory) errors.jobCategory = "Job category is required";
      if (!data.experienceLevel)
        errors.experienceLevel = "Experience level is required";
      if (!data.headline?.trim())
        errors.headline = "Professional headline is required";
    }
    if (role === "handyman") {
      if (!data.trade) errors.trade = "Trade is required";
      if (!data.yearsExperience && data.yearsExperience !== 0)
        errors.yearsExperience = "Years of experience is required";
    }
    if (role === "employer") {
      if (!data.companyName?.trim())
        errors.companyName = "Company name is required";
      if (!data.industry) errors.industry = "Industry is required";
    }
  }

  return errors;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function OnboardingForm({ role }) {
  const router = useRouter();
  const { setUser } = useAuth();

  const totalSteps = role === "jobseeker" ? 3 : 2;
  const stepLabels = {
    jobseeker: ["Basic Info", "Career Details", "Resume & Photo"],
    handyman: ["Basic Info", "Trade Details"],
    employer: ["Basic Info", "Company Details"],
  }[role];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // shared
    phone: "",
    whatsapp: "",
    state: "",
    city: "",
    // jobseeker
    headline: "",
    tagline: "",
    jobCategory: "",
    experienceLevel: "",
    skills: "",
    linkedin: "",
    github: "",
    resume: null,
    avatar: null,
    // handyman
    trade: "",
    yearsExperience: "",
    certifications: "",
    bio: "",
    // employer
    companyName: "",
    companySize: "",
    industry: "",
    companyWebsite: "",
    companyLinkedin: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    logo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const goNext = () => {
    const errs = validateStep(role, step, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const errs = validateStep(role, step, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      // Append text fields (skip File objects and empty strings)
      const textFields = [
        "phone",
        "whatsapp",
        "state",
        "city",
        "headline",
        "tagline",
        "jobCategory",
        "experienceLevel",
        "skills",
        "linkedin",
        "github",
        "trade",
        "yearsExperience",
        "certifications",
        "bio",
        "companyName",
        "companySize",
        "industry",
        "companyWebsite",
        "companyLinkedin",
        "contactPersonName",
        "contactPersonDesignation",
      ];

      textFields.forEach((key) => {
        if (formData[key] !== "" && formData[key] != null) {
          fd.append(key, formData[key]);
        }
      });

      // Combine state + city into location string for jobseeker/handyman
      if (role !== "employer") {
        fd.append("location", `${formData.city}, ${formData.state}`);
      } else {
        fd.append("location", `${formData.city}, ${formData.state}`);
      }

      // File fields
      if (formData.resume instanceof File) fd.append("resume", formData.resume);
      if (formData.avatar instanceof File) fd.append("avatar", formData.avatar);
      if (formData.logo instanceof File) fd.append("logo", formData.logo);

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/onboarding/${role}`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // Update auth context and localStorage
      const updatedUser = res.data.user;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast.success("Onboarding complete! Welcome to TalentHQ 🎉");

      // Redirect to the correct dashboard
      setTimeout(() => {
        router.push(`/dashboard/${role}`);
      }, 800);
    } catch (err) {
      console.error("Onboarding error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Onboarding failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP CONTENT ─────────────────────────────────────────────────────────
  const renderStep = () => {
    // ── STEP 1: Basic Info (all roles) ──────────────────────────────────────
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-lime-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Basic Information
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Help employers and clients find you. This information is used to
            match you with the right opportunities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone Number *" error={errors.phone}>
              <Input
                name="phone"
                type="tel"
                placeholder="e.g. 08012345678"
                value={formData.phone}
                onChange={handleChange}
              />
            </Field>
            <Field label="WhatsApp Number">
              <Input
                name="whatsapp"
                type="tel"
                placeholder="Same as phone or different"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="State *" error={errors.state}>
              <Select
                name="state"
                value={formData.state}
                onChange={handleChange}
              >
                <option value="">Select State</option>
                {NIGERIA_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="City / Area *" error={errors.city}>
              <Input
                name="city"
                placeholder="e.g. Ikeja, Victoria Island"
                value={formData.city}
                onChange={handleChange}
              />
            </Field>
          </div>
        </div>
      );
    }

    // ── STEP 2: Role-specific ────────────────────────────────────────────────
    if (step === 2) {
      if (role === "jobseeker") {
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-lime-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Career Details
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Tell employers what you do and what you're looking for.
            </p>

            <Field label="Professional Headline *" error={errors.headline}>
              <Input
                name="headline"
                placeholder="e.g. Senior Frontend Developer | React & Next.js"
                value={formData.headline}
                onChange={handleChange}
                maxLength={120}
              />
            </Field>

            <Field label="Tagline / Short Bio">
              <Input
                name="tagline"
                placeholder="e.g. 5 years building products users love"
                value={formData.tagline}
                onChange={handleChange}
                maxLength={200}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Job Category *" error={errors.jobCategory}>
                <Select
                  name="jobCategory"
                  value={formData.jobCategory}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Experience Level *" error={errors.experienceLevel}>
                <Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option value="">Select Level</option>
                  <option value="entry">Entry Level (0–2 yrs)</option>
                  <option value="mid">Mid Level (2–5 yrs)</option>
                  <option value="senior">Senior (5–10 yrs)</option>
                  <option value="lead">Lead / Principal (10+ yrs)</option>
                  <option value="executive">Executive / C-Suite</option>
                </Select>
              </Field>
            </div>

            <Field label="Key Skills (comma-separated)">
              <Input
                name="skills"
                placeholder="e.g. React, Node.js, PostgreSQL, Product Management"
                value={formData.skills}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-400 mt-1">
                You can add more skills in detail from your dashboard profile
                page.
              </p>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="LinkedIn URL">
                <Input
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </Field>
              <Field label="GitHub / Portfolio URL">
                <Input
                  name="github"
                  type="url"
                  placeholder="https://github.com/yourname"
                  value={formData.github}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </div>
        );
      }

      if (role === "handyman") {
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-lime-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Trade Details
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Tell clients what trade you practice and how experienced you are.
            </p>

            <Field label="Trade / Specialization *" error={errors.trade}>
              <Select
                name="trade"
                value={formData.trade}
                onChange={handleChange}
              >
                <option value="">Select your trade</option>
                {HANDYMAN_TRADES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Years of Experience *" error={errors.yearsExperience}>
              <Select
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleChange}
              >
                <option value="">Select experience</option>
                <option value="0">Less than 1 year</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="5">5 years</option>
                <option value="7">7 years</option>
                <option value="10">10+ years</option>
                <option value="15">15+ years</option>
              </Select>
            </Field>

            <Field label="Certifications / Qualifications">
              <Input
                name="certifications"
                placeholder="e.g. NABTEB Certified, COREN, SON Approved"
                value={formData.certifications}
                onChange={handleChange}
              />
            </Field>

            <Field label="Brief Bio">
              <Textarea
                name="bio"
                placeholder="Describe your experience, the type of jobs you handle best, and your work ethic..."
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {formData.bio.length}/500
              </p>
            </Field>
          </div>
        );
      }

      if (role === "employer") {
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-lime-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Company Details
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Help candidates learn about your company before applying.
            </p>

            <Field label="Company Name *" error={errors.companyName}>
              <Input
                name="companyName"
                placeholder="e.g. Acme Technologies Ltd"
                value={formData.companyName}
                onChange={handleChange}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Industry *" error={errors.industry}>
                <Select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Company Size">
                <Select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="500+">500+ employees</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company Website">
                <Input
                  name="companyWebsite"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Company LinkedIn">
                <Input
                  name="companyLinkedin"
                  type="url"
                  placeholder="https://linkedin.com/company/..."
                  value={formData.companyLinkedin}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Person Name">
                <Input
                  name="contactPersonName"
                  placeholder="e.g. Amaka Obi"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Contact Person Designation">
                <Input
                  name="contactPersonDesignation"
                  placeholder="e.g. Head of People"
                  value={formData.contactPersonDesignation}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <Field label="Company Logo">
              <FileUploadButton
                label="Upload company logo"
                accept="image/*"
                file={formData.logo}
                hint="PNG, JPG or SVG — max 2MB"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, logo: e.target.files[0] }))
                }
              />
            </Field>
          </div>
        );
      }
    }

    // ── STEP 3: Jobseeker — Resume & Photo ──────────────────────────────────
    if (step === 3 && role === "jobseeker") {
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-lime-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Resume & Profile Photo
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Profiles with a photo and resume get <strong>3× more views</strong>.
            You can also skip this step and add them later from your dashboard.
          </p>

          <Field label="Profile Photo">
            <FileUploadButton
              label="Upload profile photo"
              accept="image/*"
              file={formData.avatar}
              hint="JPG or PNG — max 5MB. Clear, professional photo recommended."
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }))
              }
            />
          </Field>

          {formData.avatar && (
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(formData.avatar)}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-lime-500"
              />
            </div>
          )}

          <Field label="Resume / CV (PDF recommended)">
            <FileUploadButton
              label="Upload your resume"
              accept=".pdf,.doc,.docx"
              file={formData.resume}
              hint="PDF, DOC or DOCX — max 10MB"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, resume: e.target.files[0] }))
              }
            />
          </Field>

          <div className="bg-lime-50 border border-lime-200 rounded-lg p-3 text-sm text-lime-800">
            <strong>Tip:</strong> You can always update your resume and photo
            from your profile page after onboarding.
          </div>
        </div>
      );
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to <span className="text-lime-600">TalentHQ</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {role === "jobseeker" &&
              "Set up your job seeker profile to start applying"}
            {role === "handyman" &&
              "Set up your trade profile to start receiving gig requests"}
            {role === "employer" &&
              "Set up your company profile to start posting jobs"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <ProgressBar step={step} total={totalSteps} labels={stepLabels} />
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 ml-auto px-6 py-2.5 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 ml-auto px-6 py-2.5 bg-lime-600 hover:bg-lime-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Setup
                </>
              )}
            </button>
          )}
        </div>

        {/* Skip link (only on final step or step 3 for jobseeker) */}
        {((role === "jobseeker" && step === 3) ||
          (role !== "jobseeker" && step === totalSteps)) && (
          <p className="text-center text-xs text-gray-400 mt-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${role}`)}
              className="underline hover:text-gray-600 transition"
            >
              Skip for now — I'll complete this later
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
