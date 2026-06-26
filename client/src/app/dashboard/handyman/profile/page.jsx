"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Camera,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  ImageIcon,
  Briefcase,
  Wrench,
  User,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const INP =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 focus:bg-white transition";
const LBL = "block text-xs font-semibold text-gray-600 mb-1";

const TRADES = [
  "Plumber", "Electrician", "Carpenter", "Painter", "Welder",
  "Bricklayer / Mason", "Tiler", "Roofer", "HVAC Technician",
  "Generator Technician", "Auto Mechanic", "Vulcanizer",
  "Tailor / Seamstress", "Barber / Hairstylist", "Graphic Designer",
  "Web Designer", "Photographer", "Videographer", "Caterer / Chef",
  "Cleaner", "Security Guard", "Driver", "Laundry / Dry Cleaner",
  "AC Technician", "Solar Installer", "CCTV Installer",
  "Interior Decorator", "Fumigator / Pest Control", "Glazier", "Other",
];

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
        toast.type === "error" ? "bg-red-600 text-white" : "bg-lime-600 text-white"
      }`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={15} />
      ) : (
        <CheckCircle2 size={15} />
      )}
      {toast.msg}
    </div>
  );
}

// ── Portfolio item form modal ───────────────────────────────────────────────────
function PortfolioModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: item?.title || "",
    description: item?.description || "",
    link: item?.link || "",
    imageUrl: item?.imageUrl || "",
  });
  const [preview, setPreview] = useState(item?.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setForm((p) => ({ ...p, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (item?._id) {
        const res = await axios.put(
          `${API}/api/handymen/me/portfolio/${item._id}`,
          form,
          { withCredentials: true },
        );
        onSaved(res.data.item, "update");
      } else {
        const res = await axios.post(
          `${API}/api/handymen/me/portfolio`,
          form,
          { withCredentials: true },
        );
        onSaved(res.data.item, "add");
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-900">
            {item?._id ? "Edit Portfolio Item" : "Add Portfolio Item"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image upload */}
          <div>
            <label className={LBL}>Image (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 transition cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center"
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Camera size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon size={32} />
                  <span className="text-xs font-medium">Click to upload image</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            {preview && (
              <button
                onClick={() => {
                  setPreview("");
                  setForm((p) => ({ ...p, imageUrl: "" }));
                }}
                className="mt-1 text-xs text-gray-400 hover:text-red-500"
              >
                Remove image
              </button>
            )}
          </div>

          <div>
            <label className={LBL}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              maxLength={100}
              className={INP}
              placeholder="e.g. Kitchen Renovation, Logo Design"
            />
          </div>

          <div>
            <label className={LBL}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              maxLength={500}
              rows={3}
              className={INP}
              placeholder="Briefly describe this work…"
            />
          </div>

          <div>
            <label className={LBL}>Project Link</label>
            <div className="relative">
              <Link2
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={form.link}
                onChange={(e) =>
                  setForm((p) => ({ ...p, link: e.target.value }))
                }
                className={`${INP} pl-9`}
                placeholder="https://…"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-semibold">{error}</p>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
function HandymanProfilePage() {
  const { user, refetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [profileForm, setProfileForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarBase64, setAvatarBase64] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [portfolioModal, setPortfolioModal] = useState(null); // null | {} | {item}
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load profile
  useEffect(() => {
    axios
      .get(`${API}/api/handymen/me`, { withCredentials: true })
      .then((res) => {
        const h = res.data.handyman;
        setProfile(h);
        setProfileForm({
          fullName: h.fullName || "",
          phone: h.phone || "",
          whatsapp: h.whatsapp || "",
          trade: h.trade || "",
          yearsExperience: h.yearsExperience || "",
          location: h.location || "",
          bio: h.bio || "",
          skills: Array.isArray(h.skills) ? h.skills.join(", ") : (h.skills || ""),
          certifications: h.certifications || "",
        });
        setAvatarPreview(h.avatar || "");
      })
      .catch(() => notify("Failed to load profile", "error"))
      .finally(() => setLoadingProfile(false));
  }, []);

  // Load portfolio
  useEffect(() => {
    axios
      .get(`${API}/api/handymen/me/portfolio`, { withCredentials: true })
      .then((res) => setPortfolio(res.data.portfolio || []))
      .catch(() => {})
      .finally(() => setLoadingPortfolio(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setAvatarBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = { ...profileForm };
      if (avatarBase64) payload.avatar = avatarBase64;
      await axios.patch(`${API}/api/handymen/me`, payload, {
        withCredentials: true,
      });
      setAvatarBase64("");
      if (refetchUser) await refetchUser();
      notify("Profile updated successfully");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePortfolioSaved = (item, mode) => {
    setPortfolio((prev) => {
      if (mode === "add") return [item, ...prev];
      return prev.map((p) => (p._id === item._id ? item : p));
    });
    notify(mode === "add" ? "Portfolio item added" : "Portfolio item updated");
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this portfolio item?")) return;
    setDeletingId(itemId);
    try {
      await axios.delete(`${API}/api/handymen/me/portfolio/${itemId}`, {
        withCredentials: true,
      });
      setPortfolio((prev) => prev.filter((p) => p._id !== itemId));
      notify("Portfolio item deleted");
    } catch {
      notify("Failed to delete item", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const set = (k, v) => setProfileForm((p) => ({ ...p, [k]: v }));

  const initials = (user?.fullName || "H")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <Toast toast={toast} />

      {portfolioModal !== null && (
        <PortfolioModal
          item={portfolioModal._id ? portfolioModal : null}
          onClose={() => setPortfolioModal(null)}
          onSaved={handlePortfolioSaved}
        />
      )}

      {/* ── Profile section ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
          <User size={16} className="text-amber-500" />
          <h2 className="font-bold text-gray-900">My Profile</h2>
        </div>

        {loadingProfile ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="flex gap-5">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-2xl">
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow transition"
                >
                  <Camera size={13} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {profile?.fullName}
                </p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
                {avatarBase64 && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    New photo selected — save to apply
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Full Name</label>
                <input
                  value={profileForm.fullName || ""}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Trade</label>
                <select
                  value={profileForm.trade || ""}
                  onChange={(e) => set("trade", e.target.value)}
                  className={INP}
                >
                  <option value="">Select trade…</option>
                  {TRADES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LBL}>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={profileForm.yearsExperience || ""}
                  onChange={(e) => set("yearsExperience", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>Location</label>
                <input
                  value={profileForm.location || ""}
                  onChange={(e) => set("location", e.target.value)}
                  className={INP}
                  placeholder="e.g. Lagos, Ikeja"
                />
              </div>
              <div>
                <label className={LBL}>Phone</label>
                <input
                  value={profileForm.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  className={INP}
                />
              </div>
              <div>
                <label className={LBL}>WhatsApp</label>
                <input
                  value={profileForm.whatsapp || ""}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  className={INP}
                  placeholder="+234…"
                />
              </div>
            </div>

            <div>
              <label className={LBL}>Bio</label>
              <textarea
                value={profileForm.bio || ""}
                onChange={(e) => set("bio", e.target.value)}
                rows={4}
                maxLength={1000}
                className={INP}
                placeholder="Tell clients about yourself and your work…"
              />
            </div>

            <div>
              <label className={LBL}>Skills (comma-separated)</label>
              <input
                value={profileForm.skills || ""}
                onChange={(e) => set("skills", e.target.value)}
                className={INP}
                placeholder="e.g. Plumbing, Pipe fitting, Leak repair"
              />
            </div>

            <div>
              <label className={LBL}>Certifications (comma-separated)</label>
              <input
                value={profileForm.certifications || ""}
                onChange={(e) => set("certifications", e.target.value)}
                className={INP}
                placeholder="e.g. COREN, City & Guilds, NABTEB"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition disabled:opacity-50"
              >
                {savingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {savingProfile ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Portfolio section ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-amber-500" />
            <h2 className="font-bold text-gray-900">My Portfolio</h2>
            <span className="text-xs text-gray-400">
              ({portfolio.length}/20 items)
            </span>
          </div>
          {portfolio.length < 20 && (
            <button
              onClick={() => setPortfolioModal({})}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition"
            >
              <Plus size={13} /> Add Item
            </button>
          )}
        </div>

        <div className="p-6">
          {loadingPortfolio ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-gray-100 overflow-hidden"
                >
                  <div className="h-40 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
                <Briefcase size={26} className="text-amber-300" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">
                No portfolio items yet
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Showcase your best work — add images, links and descriptions
              </p>
              <button
                onClick={() => setPortfolioModal({})}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition"
              >
                <Plus size={14} /> Add First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:border-amber-200 hover:shadow-sm transition group"
                >
                  {item.imageUrl ? (
                    <div className="relative h-40">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-amber-50 flex items-center justify-center">
                      <ImageIcon size={32} className="text-amber-200" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold"
                          >
                            <Link2 size={11} /> View Project
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setPortfolioModal(item)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          disabled={deletingId === item._id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition disabled:opacity-40"
                        >
                          {deletingId === item._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["handyman"]}>
      <HandymanProfilePage />
    </ProtectedRoute>
  );
}
