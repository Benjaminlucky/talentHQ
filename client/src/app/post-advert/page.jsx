"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Megaphone,
  Globe,
  Sidebar,
  Layout,
  MapPin,
  Clock,
  DollarSign,
  Image,
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const ZONES = [
  {
    id: "sidebar",
    label: "Sidebar Banner",
    icon: Sidebar,
    desc: "Displayed in the right sidebar on all main pages",
    daily: 500,
    dimensions: "300×250px",
  },
  {
    id: "feed_inline",
    label: "Feed Inline",
    icon: Layout,
    desc: "Appears between job listings on the Find Jobs page",
    daily: 800,
    dimensions: "728×90px",
  },
  {
    id: "feed_top",
    label: "Feed Top Banner",
    icon: Layout,
    desc: "Prominent position above all job listings",
    daily: 1200,
    dimensions: "1200×120px",
  },
  {
    id: "findjob_banner",
    label: "Hero Banner",
    icon: MapPin,
    desc: "Full-width banner at the top of the Find Jobs hero section",
    daily: 2000,
    dimensions: "1440×200px",
  },
];

const DURATIONS = [7, 14, 30, 60, 90];

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

export default function PostAdvertPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    ctaText: "Learn More",
    zone: "sidebar",
    durationDays: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectedZone = ZONES.find((z) => z.id === form.zone);
  const totalPrice = (selectedZone?.daily || 500) * Number(form.durationDays);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=/post-advert");
      return;
    }
    if (!form.title.trim() || !form.linkUrl.trim()) {
      setError("Ad title and destination URL are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/payments/ad/initialize`, form, {
        withCredentials: true,
      });
      // Redirect to Paystack
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to initialize payment. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Megaphone size={18} className="text-white" />
            </div>
            Place an Advertisement
          </h1>
          <p className="text-sm text-gray-500 mt-2 ml-14">
            Reach thousands of Nigerian professionals, jobseekers, and employers
            on TalentHQ.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: form */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <Section title="Ad Content" icon={Megaphone}>
                <div>
                  <label className={LBL}>Ad Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Hire Nigeria's Best Tech Talent"
                    className={INP}
                    required
                    maxLength={80}
                  />
                  <p className="text-right text-[10px] text-gray-400 mt-0.5">
                    {form.title.length}/80
                  </p>
                </div>
                <div>
                  <label className={LBL}>Ad Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Brief compelling description of your ad..."
                    rows={3}
                    className={`${INP} resize-none`}
                    required
                    maxLength={300}
                  />
                  <p className="text-right text-[10px] text-gray-400 mt-0.5">
                    {form.description.length}/300
                  </p>
                </div>
                <div>
                  <label className={LBL}>Destination URL *</label>
                  <div className="relative">
                    <Link2
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="url"
                      value={form.linkUrl}
                      onChange={(e) => set("linkUrl", e.target.value)}
                      placeholder="https://yourcompany.com/jobs"
                      className={`${INP} pl-9`}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LBL}>CTA Button Text</label>
                    <input
                      value={form.ctaText}
                      onChange={(e) => set("ctaText", e.target.value)}
                      placeholder="Learn More"
                      className={INP}
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className={LBL}>Ad Image URL (optional)</label>
                    <div className="relative">
                      <Image
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => set("imageUrl", e.target.value)}
                        placeholder="https://cdn.example.com/banner.jpg"
                        className={`${INP} pl-9`}
                      />
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Placement Zone" icon={Globe}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ZONES.map((zone) => {
                    const ZoneIcon = zone.icon;
                    const sel = form.zone === zone.id;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => set("zone", zone.id)}
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          sel
                            ? "border-primary-400 bg-primary-50"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <ZoneIcon
                            size={14}
                            className={
                              sel ? "text-primary-600" : "text-gray-400"
                            }
                          />
                          <p
                            className={`font-bold text-sm ${sel ? "text-primary-700" : "text-gray-900"}`}
                          >
                            {zone.label}
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-2">
                          {zone.desc}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            {zone.dimensions}
                          </span>
                          <span
                            className={`text-xs font-bold ${sel ? "text-primary-600" : "text-gray-500"}`}
                          >
                            ₦{zone.daily.toLocaleString()}/day
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Duration" icon={Clock}>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set("durationDays", d)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                        form.durationDays === d
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </Section>
            </div>

            {/* Right: summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6 space-y-4">
                <h3 className="font-black text-gray-900 text-sm">
                  Order Summary
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Zone</span>
                    <span className="font-semibold text-gray-900">
                      {selectedZone?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold text-gray-900">
                      {form.durationDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily rate</span>
                    <span className="font-semibold text-gray-900">
                      ₦{selectedZone?.daily.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-lg text-primary-600">
                      ₦{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition shadow-lg shadow-primary-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <DollarSign size={15} />
                      Pay ₦{totalPrice.toLocaleString()}
                    </>
                  )}
                </button>

                <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 flex items-start gap-1.5 leading-relaxed">
                    <Info size={11} className="flex-shrink-0 mt-0.5" />
                    After payment, your ad enters a 24h review queue. Approved
                    ads go live immediately. Payments processed by Paystack.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
