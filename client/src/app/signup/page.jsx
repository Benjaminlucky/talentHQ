"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Shield,
  X,
  ExternalLink,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";

// ── Inline Terms of Service modal ─────────────────────────────────────────────
function TosModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">Terms of Service</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 text-sm text-gray-600 leading-relaxed space-y-4">
          <p className="text-xs text-gray-400 italic">
            Last updated: {new Date().getFullYear()}. By creating an account you
            agree to these terms.
          </p>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">
              1. Platform Role & Liability
            </h3>
            <p>
              TalentHQ is an employment marketplace that connects employers,
              jobseekers, and skilled tradespeople. We are not a recruitment
              agency, staffing firm, or party to any employment contract.
              TalentHQ is not responsible for the accuracy of job listings,
              employer claims, or candidate information posted on the platform.
              All users interact at their own risk.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">
              2. User-Generated Content
            </h3>
            <p>
              Content posted on TalentHQ — including job listings, profiles,
              reviews, and messages — is the sole responsibility of the user who
              posted it. TalentHQ does not endorse, verify, or guarantee the
              accuracy of any user-generated content. Reviews reflect the
              opinions of individual users and not TalentHQ's views.
            </p>
            <p className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <strong>Review disclaimer:</strong> Reviews and ratings on
              TalentHQ are user-generated opinions. TalentHQ does not verify the
              accuracy of reviews and accepts no liability for loss arising from
              reliance on review content. If you believe a review is false or
              defamatory, you may report it to our moderation team.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">
              3. Employer Verification
            </h3>
            <p>
              Employers may optionally provide a CAC (Corporate Affairs
              Commission) registration number during onboarding. TalentHQ does
              not independently verify CAC numbers against any government
              registry. The presence of a CAC number does not constitute
              verification of a company's legal status or legitimacy. Users
              should perform their own due diligence before accepting any job
              offer.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">
              4. Prohibited Content
            </h3>
            <p>
              Users must not post fraudulent job listings, impersonate
              individuals or companies, submit false reviews, harass other
              users, or use the platform for any unlawful purpose. Violations
              may result in immediate account suspension and removal of content.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">
              5. Reporting & Moderation
            </h3>
            <p>
              TalentHQ provides content flagging tools that allow users to
              report fraudulent listings, abusive profiles, and inappropriate
              reviews. Reported content is reviewed by our moderation team. We
              reserve the right to remove content, suspend accounts, or take
              other action at our sole discretion. We do not guarantee a
              specific response time or outcome for any report.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">
              6. Limitation of Liability
            </h3>
            <p>
              To the fullest extent permitted by Nigerian law, TalentHQ and its
              affiliates shall not be liable for any direct, indirect,
              incidental, or consequential damages arising from your use of the
              platform, including but not limited to employment decisions,
              financial losses, or disputes between users. TalentHQ's total
              aggregate liability shall not exceed ₦10,000.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">7. Privacy & Data</h3>
            <p>
              By creating an account you consent to TalentHQ processing your
              personal data in accordance with our{" "}
              <Link
                href="/privacy"
                className="text-primary-600 font-semibold hover:underline"
              >
                Privacy Policy
              </Link>
              . We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">8. Governing Law</h3>
            <p>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria. Any disputes shall be subject to the exclusive
              jurisdiction of Nigerian courts.
            </p>
          </section>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Role selector ─────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "jobseeker",
    label: "Jobseeker",
    desc: "Find professional opportunities",
    emoji: "👔",
  },
  {
    id: "handyman",
    label: "Handyman",
    desc: "Offer skilled trade services",
    emoji: "🔧",
  },
  {
    id: "employer",
    label: "Employer",
    desc: "Post jobs and hire talent",
    emoji: "🏢",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [tosOpen, setTosOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: "",
    skills: "",
    location: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRoleSelect = (r) => {
    setRole(r);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must accept the Terms of Service to create an account.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role,
        agreedToTerms: true,
        agreedAt: new Date().toISOString(),
      };
      if (role === "handyman") {
        payload.skills = form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        payload.location = form.location;
      }
      if (role === "employer") {
        payload.companyName = form.companyName;
        payload.companyWebsite = form.companyWebsite;
      }

      await axios.post(`${API}/api/auth/signup2`, payload, {
        withCredentials: true,
      });
      router.push(`/onboarding/${role}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      {tosOpen && <TosModal onClose={() => setTosOpen(false)} />}

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-gray-900">
            Talent<span className="text-lime-600">HQ</span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">
            Nigeria's talent marketplace
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <>
              <h2 className="text-xl font-black text-gray-900 mb-1">
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose how you'll use TalentHQ
              </p>
              <div className="space-y-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-primary-300 hover:bg-primary-50 rounded-2xl transition-all group text-left"
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm group-hover:text-primary-700">
                        {r.label}
                      </p>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="ml-auto text-gray-300 group-hover:text-primary-500 transition-colors"
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="text-xl font-black text-gray-900 mb-1">
                Sign up as {ROLES.find((r) => r.id === role)?.label}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Fill in your details to get started
              </p>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-5">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Your full name"
                    className={INP}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                    className={INP}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`${INP} pr-10`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {role === "handyman" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Skills
                      </label>
                      <input
                        value={form.skills}
                        onChange={(e) => set("skills", e.target.value)}
                        placeholder="Plumbing, Electrical, Tiling (comma separated)"
                        className={INP}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Location
                      </label>
                      <input
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="e.g. Surulere, Lagos"
                        className={INP}
                      />
                    </div>
                  </>
                )}

                {role === "employer" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Company Name *
                      </label>
                      <input
                        value={form.companyName}
                        onChange={(e) => set("companyName", e.target.value)}
                        placeholder="Your company name"
                        className={INP}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Company Website
                      </label>
                      <input
                        value={form.companyWebsite}
                        onChange={(e) => set("companyWebsite", e.target.value)}
                        placeholder="https://yourcompany.com"
                        className={INP}
                      />
                    </div>
                  </>
                )}

                {/* ── ToS gate — required before submit ──────────────────────────── */}
                <div className="pt-2">
                  <div
                    className={`p-4 rounded-xl border-2 transition-colors ${agreed ? "border-lime-300 bg-lime-50" : "border-gray-200 bg-gray-50"}`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                            agreed
                              ? "border-lime-500 bg-lime-500"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {agreed && (
                            <CheckCircle2
                              size={13}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I have read and agree to TalentHQ's{" "}
                        <button
                          type="button"
                          onClick={() => setTosOpen(true)}
                          className="text-primary-600 font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Terms of Service <ExternalLink size={11} />
                        </button>{" "}
                        and acknowledge the{" "}
                        <button
                          type="button"
                          onClick={() => setTosOpen(true)}
                          className="text-primary-600 font-bold hover:underline"
                        >
                          platform liability disclaimer
                        </button>
                        .
                      </span>
                    </label>
                    {!agreed && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5 ml-8">
                        <Shield size={11} /> You must accept the Terms of
                        Service to create an account
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm transition"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
