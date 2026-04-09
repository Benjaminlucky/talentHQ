"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  Send,
  Search,
  MessageSquare,
  ArrowLeft,
  User,
  MoreVertical,
  Trash2,
  Loader2,
  CheckCheck,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;
const POLL_INTERVAL = 4000; // poll every 4 seconds

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)
    return d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function chatTime(date) {
  return new Date(date).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function chatDate(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Group messages by date
function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const m of messages) {
    const d = chatDate(m.createdAt);
    if (d !== lastDate) {
      groups.push({ type: "date", label: d });
      lastDate = d;
    }
    groups.push({ type: "message", data: m });
  }
  return groups;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonConvo() {
  return (
    <div className="p-4 flex items-center gap-3 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-48 bg-gray-100 rounded" />
      </div>
      <div className="h-3 w-10 bg-gray-100 rounded" />
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = "md", online }) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-14 h-14 text-base",
  }[size];
  return (
    <div className="relative flex-shrink-0">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={`${sz} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sz} rounded-full bg-primary-500 flex items-center justify-center text-white font-bold`}
        >
          {initials}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-lime-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// ── Conversation list item ─────────────────────────────────────────────────────
function ConvoItem({ convo, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${
        isActive ? "bg-lime-50 border-r-2 border-lime-500" : ""
      }`}
    >
      <Avatar name={convo.other?.fullName} avatar={convo.other?.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p
            className={`text-sm font-semibold truncate ${isActive ? "text-lime-700" : "text-gray-900"}`}
          >
            {convo.other?.fullName || "Unknown"}
          </p>
          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
            {timeAgo(convo.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate flex-1">
            {convo.lastMessage || "No messages yet"}
          </p>
          {convo.unread > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
              {convo.unread > 9 ? "9+" : convo.unread}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 capitalize mt-0.5">
          {convo.other?.role}
        </p>
      </div>
    </button>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ message, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-primary-500 text-white rounded-tr-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {message.text}
        </div>
        <div
          className={`flex items-center gap-1 text-[11px] text-gray-400 ${isMe ? "flex-row-reverse" : ""}`}
        >
          <span>{chatTime(message.createdAt)}</span>
          {isMe &&
            (message.read ? (
              <CheckCheck size={12} className="text-lime-500" />
            ) : (
              <Check size={12} className="text-gray-400" />
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasConvos }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
        <MessageSquare size={32} className="text-gray-400" />
      </div>
      <h3 className="font-bold text-gray-800 text-lg mb-2">
        {hasConvos ? "Select a conversation" : "No messages yet"}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        {hasConvos
          ? "Choose a conversation from the list to view messages."
          : "Start a conversation by messaging an employer or candidate from their profile."}
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [convosLoading, setConvosLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // ── Load conversations ──────────────────────────────────────────────────────
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setConvosLoading(true);
    try {
      const res = await axios.get(`${API}/api/messages/conversations`, {
        withCredentials: true,
      });
      setConversations(res.data.conversations || []);
    } catch {
    } finally {
      if (!silent) setConvosLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages for active conversation ────────────────────────────────────
  const loadMessages = useCallback(async (convoId, silent = false) => {
    if (!silent) setMsgsLoading(true);
    try {
      const res = await axios.get(`${API}/api/messages/${convoId}`, {
        withCredentials: true,
      });
      setMessages(res.data.messages || []);
    } catch {
    } finally {
      if (!silent) setMsgsLoading(false);
    }
  }, []);

  const openConvo = useCallback(
    (convo) => {
      setActiveConvo(convo);
      setMobileShowChat(true);
      setMessages([]);
      loadMessages(convo._id);
      inputRef.current?.focus();
      // Mark as read locally
      setConversations((prev) =>
        prev.map((c) => (c._id === convo._id ? { ...c, unread: 0 } : c)),
      );
    },
    [loadMessages],
  );

  // ── Scroll to bottom on new messages ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Polling ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadConversations(true);
      if (activeConvo) loadMessages(activeConvo._id, true);
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [activeConvo, loadConversations, loadMessages]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activeConvo || sending) return;
    const t = text.trim();
    setText("");
    setSending(true);
    setError("");

    // Optimistic update
    const optimistic = {
      _id: `opt_${Date.now()}`,
      conversationId: activeConvo._id,
      senderId: user._id,
      text: t,
      createdAt: new Date().toISOString(),
      read: false,
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await axios.post(
        `${API}/api/messages/${activeConvo._id}`,
        { text: t },
        { withCredentials: true },
      );
      // Replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? res.data.message : m)),
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConvo._id
            ? { ...c, lastMessage: t, lastMessageAt: new Date().toISOString() }
            : c,
        ),
      );
    } catch (err) {
      setError("Failed to send. Please try again.");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setText(t); // restore text
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Delete conversation ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/messages/conversations/${deleteTarget}`, {
        withCredentials: true,
      });
      setConversations((prev) => prev.filter((c) => c._id !== deleteTarget));
      if (activeConvo?._id === deleteTarget) {
        setActiveConvo(null);
        setMessages([]);
        setMobileShowChat(false);
      }
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete conversation");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = conversations.filter(
    (c) =>
      !search ||
      c.other?.fullName?.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = groupByDate(messages);
  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unread || 0),
    0,
  );

  return (
    <ProtectedRoute allowedRoles={["jobseeker", "employer", "handyman"]}>
      <div className="h-[calc(100vh-5rem)] flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        {/* ── SIDEBAR: Conversation list ─────────────────────────────────── */}
        <div
          className={`${mobileShowChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-gray-100 flex-shrink-0`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <MessageSquare size={18} className="text-lime-600" />
                Messages
                {totalUnread > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </h1>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {convosLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonConvo key={i} />
                ))}
              </>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <MessageSquare size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-600">
                  {search
                    ? "No conversations match your search"
                    : "No conversations yet"}
                </p>
                {!search && (
                  <p className="text-xs text-gray-400 mt-1">
                    Message employers or candidates from their profiles
                  </p>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((convo) => (
                  <motion.div
                    key={convo._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ConvoItem
                      convo={convo}
                      isActive={activeConvo?._id === convo._id}
                      onClick={() => openConvo(convo)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── MAIN: Chat thread ─────────────────────────────────────────── */}
        <div
          className={`${!mobileShowChat ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}
        >
          {!activeConvo ? (
            <EmptyState hasConvos={conversations.length > 0} />
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMobileShowChat(false);
                      setActiveConvo(null);
                    }}
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 mr-1"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar
                    name={activeConvo.other?.fullName}
                    avatar={activeConvo.other?.avatar}
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {activeConvo.other?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {activeConvo.other?.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(activeConvo._id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                  title="Delete conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-gray-50">
                {msgsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={24} className="animate-spin text-lime-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-gray-500">
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  grouped.map((item, i) =>
                    item.type === "date" ? (
                      <div
                        key={`date_${i}`}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[11px] font-semibold text-gray-400 px-2">
                          {item.label}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    ) : (
                      <MessageBubble
                        key={item.data._id}
                        message={item.data}
                        isMe={
                          item.data.senderId?.toString() ===
                          user?._id?.toString()
                        }
                      />
                    ),
                  )
                )}
                <div ref={bottomRef} />
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 pb-2 flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle size={13} />
                  {error}
                  <button onClick={() => setError("")} className="ml-auto">
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${activeConvo.other?.fullName?.split(" ")[0]}…`}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 focus:bg-white transition max-h-32 overflow-y-auto"
                      style={{ height: "44px" }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-2xl transition-colors"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Delete conversation?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                All messages in this conversation will be permanently deleted.
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}
