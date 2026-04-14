"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, memo } from "react";
import { Menu, X, Zap } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/postjob", label: "Post Job" },
  { href: "/findjob", label: "Find Job" },
  { href: "/find-candidates", label: "Find Candidate" },
  { href: "/post-advert", label: "Post Advert" },
  { href: "/pricing", label: "Pricing", highlight: true },
  { href: "/reach-us", label: "Reach Us" },
];

function NavbarComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" prefetch className="text-xl font-bold text-gray-800">
          Talent<span className="text-primary-500">HQ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-6 items-center">
            {navItems.map(({ href, label, highlight }) => (
              <li key={href}>
                {highlight ? (
                  <Link
                    href={href}
                    prefetch
                    onMouseEnter={() => router.prefetch(href)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                      pathname === href
                        ? "bg-primary-500 text-white"
                        : "bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200"
                    }`}
                  >
                    <Zap size={12} />
                    {label}
                  </Link>
                ) : (
                  <Link
                    href={href}
                    prefetch
                    onMouseEnter={() => router.prefetch(href)}
                    className={`hover:text-lime-500 transition-colors text-sm ${
                      pathname === href
                        ? "text-lime-500 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="flex space-x-3">
            <Link
              href="/login"
              prefetch
              onMouseEnter={() => router.prefetch("/login")}
              className="px-4 py-2 border border-lime-500 text-primary-600 rounded-lg text-sm font-semibold hover:bg-lime-50 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              prefetch
              onMouseEnter={() => router.prefetch("/signup")}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden text-gray-700"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-screen bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <Link href="/" prefetch className="text-xl font-bold text-gray-800">
            Talent<span className="text-primary-500">HQ</span>
          </Link>
          <button onClick={() => setMenuOpen(false)}>
            <X size={28} />
          </button>
        </div>

        <ul className="flex flex-col space-y-5 p-6">
          {navItems.map(({ href, label, highlight }) => (
            <li key={href}>
              {highlight ? (
                <Link
                  href={href}
                  prefetch
                  onClick={() => setMenuOpen(false)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${
                    pathname === href
                      ? "bg-primary-500 text-white"
                      : "bg-primary-50 text-primary-600 border border-primary-200"
                  }`}
                >
                  <Zap size={13} /> {label}
                </Link>
              ) : (
                <Link
                  href={href}
                  prefetch
                  onClick={() => setMenuOpen(false)}
                  className={`block text-lg transition-colors ${
                    pathname === href
                      ? "text-lime-500 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="px-6 mt-4 flex flex-col space-y-3">
          <Link
            href="/login"
            prefetch
            onClick={() => setMenuOpen(false)}
            className="text-center px-4 py-2.5 border border-lime-500 text-primary-600 rounded-lg text-sm font-semibold hover:bg-lime-50 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            prefetch
            onClick={() => setMenuOpen(false)}
            className="text-center px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default memo(NavbarComponent);
