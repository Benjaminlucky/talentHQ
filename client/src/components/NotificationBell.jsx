"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, X, Loader2, Info } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

const TYPE_ICON = {
  application_received: "📋",
  application_status: "📬",
  interview_scheduled: "📅",
  interview_responded: "✅",
  new_message: "💬",
  review_received: "⭐",
};

export default function NotificationBell() {
  const router = useRouter();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  // ── Fetch unread count (lightweight, runs on interval) ────────────────────
  const fetchCount = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/notifications/unread-count`, {
        withCredentials: true,
      });
      setUnread(res.data.count || 0);
    } catch {}
  }, []);

  // ── Fetch full list (only when dropdown opens) ────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/notifications?limit=30`, {
        withCredentials: true,
      });
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) fetchNotifications();
  };

  const markRead = async (n) => {
    if (!n.read) {
      await axios
        .patch(
          `${API}/api/notifications/${n._id}/read`,
          {},
          { withCredentials: true },
        )
        .catch(() => {});
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)),
      );
      setUnread((v) => Math.max(0, v - 1));
    }
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  };

  const markAllRead = async () => {
    await axios
      .patch(
        `${API}/api/notifications/mark-all-read`,
        {},
        { withCredentials: true },
      )
      .catch(() => {});
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const clearAll = async () => {
    setClearing(true);
    await axios
      .delete(`${API}/api/notifications/clear-all`, { withCredentials: true })
      .catch(() => {});
    setNotifications([]);
    setUnread(0);
    setClearing(false);
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    await axios
      .delete(`${API}/api/notifications/${id}`, { withCredentials: true })
      .catch(() => {});
    setNotifications((prev) => {
      const removed = prev.find((x) => x._id === id);
      if (removed && !removed.read) setUnread((v) => Math.max(0, v - 1));
      return prev.filter((x) => x._id !== id);
    });
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-gray-900 text-sm">
                  Notifications
                </h3>
                {unread > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all read"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-lime-600 transition"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={clearing}
                    title="Clear all"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {clearing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                    <Bell size={18} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">
                    All caught up!
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markRead(n)}
                    className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 last:border-0 group ${
                      n.read
                        ? "hover:bg-gray-50"
                        : "bg-lime-50/60 hover:bg-lime-50"
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}

                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {TYPE_ICON[n.type] || "🔔"}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold leading-snug ${n.read ? "text-gray-700" : "text-gray-900"}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => deleteOne(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 text-gray-400 flex-shrink-0 transition"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
