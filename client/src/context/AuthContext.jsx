// src/context/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`,
          { withCredentials: true }
        );
        console.log("✅ /me response:", res.data);
        setUser(res.data.user || null);
      } catch (err) {
        console.error("❌ /me error:", err.response?.data || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Logout and clear user
  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Logout error:", err.response?.data || err.message);
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

export const useAuth = () => useContext(AuthContext);
