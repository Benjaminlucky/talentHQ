"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Briefcase,
  Users,
  Megaphone,
  Mail,
  Home,
  LogIn,
  UserPlus,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/findjob", label: "Find Jobs", icon: Briefcase },
  { href: "/find-candidates", label: "Find Talent", icon: Users },
  { href: "/postjob", label: "Post a Job", icon: Briefcase },
  { href: "/post-advert", label: "Advertise", icon: Megaphone },
  { href: "/reach-us", label: "Contact", icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.08)]"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">T</span>
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900">
                Talent<span className="text-lime-600">HQ</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-1">
              {navItems.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      isActive(href)
                        ? "text-lime-700 bg-lime-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                    {isActive(href) && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-lime-500 rounded-full" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div className="h-16" />

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-black text-lg">
            Talent<span className="text-lime-600">HQ</span>
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-lime-50 text-lime-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                size={16}
                className={isActive(href) ? "text-lime-600" : "text-gray-400"}
              />
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <LogIn size={16} />
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition"
          >
            <UserPlus size={16} />
            Create account
          </Link>
        </div>
      </div>
    </>
  );
}
