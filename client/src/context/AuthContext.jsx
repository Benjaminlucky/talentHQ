"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch user from backend on first load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`,
          { withCredentials: true }
        );
        setUser(res.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔓 Logout handler
  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Safe hook with fallback to prevent build-time errors
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, setUser: () => {}, logout: () => {}, loading: true };
  }
  return context;
};
