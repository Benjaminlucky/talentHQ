// src/context/AuthContext.jsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`,
        { withCredentials: true },
      );
      setUser(res.data.user || null);
    } catch (err) {
      // 401 = not logged in (normal). 403 = forbidden. Neither is an error.
      // Only warn on genuinely unexpected failures (network down, 500, etc.)
      const status = err.response?.status;
      if (status !== 401 && status !== 403) {
        console.warn("Auth check failed:", err.message);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {
      // Logout errors are non-fatal — user state is cleared regardless
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, loading, refetchUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
