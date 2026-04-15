"use client";
// src/app/data-deletion/page.jsx
import { useState } from "react";
import axios from "axios";
import { Trash2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;
const INP =
  "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition placeholder:text-gray-400";

export default function DataDeletionPage() {
  const [form, setForm] = useState({ email: "", reason: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.confirm !== "DELETE") {
      setError("Type DELETE (in capitals) to confirm.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Send as a contact message tagged as deletion request
      await axios.post(`${API}/api/contact`, {
        name: "Data Deletion Request",
        email: form.email,
        phone: "",
        subject: "NDPA Data Deletion Request",
        category: "data-deletion",
        message: `User requests deletion of all personal data.\n\nEmail: ${form.email}\nReason: ${form.reason || "Not specified"}\n\nThis is an automated submission from the /data-deletion page.`,
      });
      setDone(true);
    } catch {
      setError(
        "Submission failed. Please email privacy@talenthq.buzz directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#004b23] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-lime-400 text-xs font-bold uppercase tracking-widest mb-3">
            NDPA 2023 · Right to Erasure
          </p>
          <h1 className="text-3xl font-black mb-3">Request Data Deletion</h1>
          <p className="text-green-200 text-sm">
            Under the Nigeria Data Protection Act 2023, you have the right to
            request deletion of your personal data.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {done ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-lime-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Request received
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
              We have received your deletion request for{" "}
              <strong>{form.email}</strong>. We will process it within{" "}
              <strong>30 days</strong> and send confirmation to your email.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Reference: TalentHQ-DEL-{Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        ) : (
          <>
            {/* What gets deleted */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-black text-gray-900 text-sm mb-4">
                What will be deleted
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  "Your account and login credentials",
                  "Your public profile",
                  "CV / resume files",
                  "Work experience, skills, education",
                  "Messages sent and received",
                  "Job applications",
                  "Notifications and interview records",
                  "Profile analytics data",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Trash2 size={12} className="text-red-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-600">Retained:</strong> Payment
                  records are kept for 7 years as required by Nigerian financial
                  regulations. Anonymised aggregate analytics may be retained.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-black text-gray-900 text-sm mb-5">
                Submit deletion request
              </h2>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-4">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email address on your account *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                    required
                    className={INP}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Reason (optional)
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => set("reason", e.target.value)}
                    placeholder="Help us improve — why are you leaving?"
                    rows={3}
                    className={`${INP} resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Type DELETE to confirm *
                  </label>
                  <input
                    type="text"
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                    placeholder="DELETE"
                    required
                    className={INP}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This action is irreversible. Type DELETE in capitals to
                    confirm.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-black rounded-xl text-sm transition"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Submit deletion request
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Alternatively, email{" "}
                <a
                  href="mailto:privacy@talenthq.buzz"
                  className="text-lime-600 hover:underline"
                >
                  privacy@talenthq.buzz
                </a>{" "}
                with subject "NDPA Data Deletion Request". We respond within 30
                days.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
