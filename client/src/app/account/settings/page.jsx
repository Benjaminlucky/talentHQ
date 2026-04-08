"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";
import {
  Mail,
  Shield,
  Trash2,
  Monitor,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut,
  RefreshCw,
} from "lucide-react";

// ─── Email Verification Banner ────────────────────────────────────────────────
function VerificationBanner({ user, onResent }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/resend-verification`,
        {},
        { withCredentials: true },
      );
      setSent(true);
      onResent?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <AlertTriangle
          size={18}
          className="text-amber-600 flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="font-semibold text-amber-900 text-sm">
            Email not verified
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Verify your email to secure your account and unlock all features.
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {sent && (
            <p className="text-xs text-lime-700 mt-1">
              ✓ Verification email sent — check your inbox.
            </p>
          )}
        </div>
      </div>
      {!sent && (
        <button
          onClick={handleResend}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl text-xs transition-colors"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Mail size={13} />
          )}
          Resend Email
        </button>
      )}
    </div>
  );
}

// ─── Sessions Panel ───────────────────────────────────────────────────────────
function SessionsPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/sessions`,
        { withCredentials: true },
      );
      setSessions(res.data.sessions || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revoke = async (sessionId) => {
    setRevoking(sessionId);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/sessions/${sessionId}`,
        { withCredentials: true },
      );
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    setRevoking("all");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/sessions`,
        { withCredentials: true },
      );
      fetchSessions();
    } catch {
    } finally {
      setRevoking(null);
    }
  };

  const DeviceIcon = ({ device }) => {
    const d = device?.toLowerCase() || "";
    if (d.includes("iphone") || d.includes("android"))
      return <Smartphone size={16} className="text-gray-400" />;
    if (d.includes("mac") || d.includes("windows") || d.includes("linux"))
      return <Laptop size={16} className="text-gray-400" />;
    return <Monitor size={16} className="text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-lime-600" />
          <h2 className="font-bold text-gray-900 text-sm">Active Sessions</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSessions}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <button
              onClick={revokeAll}
              disabled={revoking === "all"}
              className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
            >
              {revoking === "all" ? "Signing out…" : "Sign out all others"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No active sessions found.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                s.isCurrent
                  ? "bg-lime-50 border border-lime-100"
                  : "border border-gray-100"
              }`}
            >
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DeviceIcon device={s.device} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {s.browser} · {s.device}
                  </p>
                  {s.isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-lime-100 text-lime-700 font-bold rounded-full flex-shrink-0">
                      THIS DEVICE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {s.ip || "Unknown IP"} ·{" "}
                  {s.lastSeenAt
                    ? `Last seen ${new Date(s.lastSeenAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
                    : `Since ${new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
              </div>
              {!s.isCurrent && (
                <button
                  onClick={() => revoke(s.id)}
                  disabled={revoking === s.id}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  {revoking === s.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <LogOut size={12} />
                  )}
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Delete Account Panel ─────────────────────────────────────────────────────
function DeleteAccountPanel() {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/account`,
        { data: { password }, withCredentials: true },
      );
      await logout();
      router.push("/?accountDeleted=true");
    } catch (err) {
      setError(
        err.response?.data?.message || "Deletion failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Trash2 size={16} className="text-red-500" />
        <h2 className="font-bold text-gray-900 text-sm">Delete Account</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Permanently delete your TalentHQ account and all associated data. This
        action cannot be undone and is in compliance with the Nigeria Data
        Protection Act (NDPA).
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-50 transition"
        >
          <Trash2 size={14} />
          Delete my account
        </button>
      ) : (
        <form onSubmit={handleDelete} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            <p className="font-bold mb-1">This will permanently:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Delete your profile, applications, and all uploaded files</li>
              <li>Sign out all active sessions immediately</li>
              <li>Remove all your personal data from our systems</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Enter your password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your current password"
              className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-50"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              {loading ? "Deleting…" : "Permanently Delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setError("");
              }}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountSettingsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["jobseeker", "handyman", "employer"]}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Account & Security
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your email verification, active sessions, and account
            settings.
          </p>
        </div>

        {/* Email verification banner */}
        <VerificationBanner user={user} />

        {/* Email verified badge */}
        {user?.emailVerified && (
          <div className="flex items-center gap-3 px-5 py-4 bg-lime-50 border border-lime-100 rounded-2xl">
            <CheckCircle2 size={18} className="text-lime-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-lime-900 text-sm">
                Email verified
              </p>
              <p className="text-xs text-lime-700">{user.email}</p>
            </div>
          </div>
        )}

        {/* Sessions */}
        <SessionsPanel />

        {/* Danger zone */}
        <DeleteAccountPanel />
      </div>
    </ProtectedRoute>
  );
}
