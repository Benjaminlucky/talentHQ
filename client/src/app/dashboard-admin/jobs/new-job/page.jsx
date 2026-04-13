"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSuperAdminAuthRedirect } from "@/app/utils/superAdminAuthRedirect";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  Building2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Search,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

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
  "Tiling",
  "Painting",
  "Welding",
  "Masonry",
  "AC Repair",
  "Other",
];
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

const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";
const LBL =
  "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
          <Icon size={15} className="text-primary-600" />
        </div>
        <h3 className="font-black text-gray-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminPostJobPage() {
  const status = useSuperAdminAuthRedirect();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [compSearch, setCompSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    responsibilities: "",
    qualification: "",
    skills: "",
    benefits: "",
    salary: "",
    experienceLevel: "",
    deadline: "",
    location: "",
    state: "",
    lga: "",
    address: "",
    phoneNumber: "",
    category: "",
    type: "Full-time",
    jobFor: "professional",
    company: "",
  });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!status) return;
    axios
      .get(`${API}/api/employers/browse?limit=100`)
      .then((r) => setCompanies(r.data.employers || []))
      .catch(() => {});
  }, [status]);

  const filteredCompanies = companies.filter((c) =>
    (c.companyName || c.fullName || "")
      .toLowerCase()
      .includes(compSearch.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.company) {
      notify("Title, description and company are required", "error");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("superadminToken");
      await axios.post(`${API}/api/jobs`, form, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      notify("Job posted successfully!");
      setTimeout(() => router.push("/dashboard-admin"), 1500);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to post job", "error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold ${toast.type === "error" ? "bg-red-600 text-white" : "bg-lime-600 text-white"}`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-gray-900">Post a Job</h1>
        <p className="text-sm text-gray-500 mt-1">
          Post a job on behalf of any registered company
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company picker */}
        <Section title="Assign to Company" icon={Building2}>
          <div>
            <label className={LBL}>Search Companies</label>
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={compSearch}
                onChange={(e) => setCompSearch(e.target.value)}
                placeholder="Search by company name…"
                className={`${INP} pl-9`}
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white">
              {filteredCompanies.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No companies found
                </p>
              ) : (
                filteredCompanies.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => set("company", c._id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50 ${form.company === c._id ? "bg-primary-50 border-l-4 border-primary-500" : ""}`}
                  >
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt=""
                        className="w-8 h-8 rounded-lg object-contain border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {(c.companyName || c.fullName || "C")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      <p
                        className={`font-bold truncate ${form.company === c._id ? "text-primary-700" : "text-gray-900"}`}
                      >
                        {c.companyName || c.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.industry} · {c.location}
                      </p>
                    </div>
                    {form.company === c._id && (
                      <CheckCircle2
                        size={15}
                        className="text-primary-500 flex-shrink-0 ml-auto"
                      />
                    )}
                  </button>
                ))
              )}
            </div>
            {!form.company && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} />
                Please select a company
              </p>
            )}
          </div>
        </Section>

        {/* Job details */}
        <Section title="Job Details" icon={Briefcase}>
          <div>
            <label className={LBL}>Job Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Senior React Developer"
              className={INP}
              required
            />
          </div>
          <div>
            <label className={LBL}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              placeholder="Describe the role, team and opportunity…"
              className={`${INP} resize-none`}
              required
            />
          </div>
          <div>
            <label className={LBL}>Responsibilities</label>
            <textarea
              value={form.responsibilities}
              onChange={(e) => set("responsibilities", e.target.value)}
              rows={3}
              placeholder="List responsibilities separated by commas"
              className={`${INP} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} />
              Comma-separated
            </p>
          </div>
          <div>
            <label className={LBL}>Qualification</label>
            <input
              value={form.qualification}
              onChange={(e) => set("qualification", e.target.value)}
              placeholder="e.g. B.Sc. Computer Science, 3+ years exp"
              className={INP}
            />
          </div>
        </Section>

        <Section title="Skills & Benefits" icon={Tag}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Required Skills</label>
              <input
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className={INP}
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className={LBL}>Benefits</label>
              <input
                value={form.benefits}
                onChange={(e) => set("benefits", e.target.value)}
                placeholder="Health insurance, Remote option"
                className={INP}
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
          </div>
        </Section>

        <Section title="Type & Compensation" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Job Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className={`${INP} cursor-pointer appearance-none`}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className={LBL}>Posted For</label>
              <select
                value={form.jobFor}
                onChange={(e) => set("jobFor", e.target.value)}
                className={`${INP} cursor-pointer appearance-none`}
              >
                <option value="professional">
                  Professional / White Collar
                </option>
                <option value="handyman">Handyman / Trade</option>
              </select>
            </div>
            <div>
              <label className={LBL}>Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={`${INP} cursor-pointer appearance-none`}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LBL}>Experience Level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => set("experienceLevel", e.target.value)}
                className={`${INP} cursor-pointer appearance-none`}
              >
                <option value="">Select Level</option>
                <option value="0-1 years">0–1 years (Entry)</option>
                <option value="1-3 years">1–3 years</option>
                <option value="2-4 years">2–4 years (Mid)</option>
                <option value="4-6 years">4–6 years (Senior)</option>
                <option value="6+ years">6+ years</option>
              </select>
            </div>
            <div>
              <label className={LBL}>Salary Range (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  ₦
                </span>
                <input
                  value={form.salary}
                  onChange={(e) => set("salary", e.target.value)}
                  placeholder="200,000 – 400,000"
                  className={`${INP} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={LBL}>Application Deadline</label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${INP} pl-9`}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Location & Contact" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LBL}>City / Location *</label>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Victoria Island, Lagos"
                className={INP}
                required
              />
            </div>
            <div>
              <label className={LBL}>State</label>
              <select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                className={`${INP} cursor-pointer appearance-none`}
              >
                <option value="">Select State</option>
                {NIGERIA_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LBL}>LGA</label>
              <input
                value={form.lga}
                onChange={(e) => set("lga", e.target.value)}
                placeholder="Local Government Area"
                className={INP}
              />
            </div>
            <div>
              <label className={LBL}>Contact Phone</label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                  placeholder="08012345678"
                  className={`${INP} pl-9`}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Full Address</label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street address, building, area"
                className={INP}
              />
            </div>
          </div>
        </Section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || !form.company}
            className="flex items-center gap-2.5 px-8 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Briefcase size={16} />
                Publish Job
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard-admin")}
            className="px-6 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-2xl text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
