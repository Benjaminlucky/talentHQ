"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, memo } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/findjob", label: "Find Jobs" },
  { href: "/find-candidates", label: "Find Talent" },
  { href: "/postjob", label: "Post Job" },
  { href: "/reach-us", label: "Contact" },
];

const DASHBOARD_ROUTES = {
  jobseeker: "/dashboard/jobseeker",
  employer: "/dashboard/employer",
  handyman: "/dashboard/handyman",
  admin: "/dashboard-admin",
};

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const initials = (user.fullName || user.companyName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dashRoute = DASHBOARD_ROUTES[user.role] || "/dashboard";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all"
      >
        {user.avatar || user.logo ? (
          <img
            src={user.avatar || user.logo}
            alt={user.fullName || user.companyName}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="text-sm font-semibold text-gray-800 max-w-[110px] truncate hidden sm:block">
          {user.fullName || user.companyName}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user.fullName || user.companyName}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-lime-100 text-lime-700 rounded-full capitalize">
              {user.role}
            </span>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              router.push(dashRoute);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <LayoutDashboard size={14} className="text-gray-400" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/account/settings");
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <User size={14} className="text-gray-400" />
            Account Settings
          </button>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavbarComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-black text-gray-900 flex-shrink-0"
        >
          Talent<span className="text-lime-600">HQ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm font-medium transition-colors hover:text-lime-600 ${
                    pathname === href
                      ? "text-lime-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-28 h-9 bg-gray-100 rounded-xl animate-pulse" />
            ) : user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:border-lime-400 hover:text-lime-700 transition"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link
            href="/"
            className="text-xl font-black text-gray-900"
            onClick={() => setMenuOpen(false)}
          >
            Talent<span className="text-lime-600">HQ</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* User info strip (mobile, logged in) */}
        {user && (
          <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
            {user.avatar || user.logo ? (
              <img
                src={user.avatar || user.logo}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                {(user.fullName || user.companyName || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">
                {user.fullName || user.companyName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <ul className="flex flex-col p-4 gap-1 mt-2">
          {NAV_ITEMS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition ${
                  pathname === href
                    ? "bg-lime-50 text-lime-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-4 mt-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link
                href={DASHBOARD_ROUTES[user.role] || "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white font-bold rounded-xl"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50"
              >
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-center px-4 py-3 bg-primary-500 text-white font-bold rounded-xl"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(NavbarComponent);
