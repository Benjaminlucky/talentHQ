"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Run: npm install lucide-react

const navItems = [
  { href: "/", label: "Home" },
  { href: "/postjob", label: "Post Job" },
  { href: "/findjob", label: "Find Job" },
  { href: "/find-candidate", label: "Find Candidate" },
  { href: "/post-advert", label: "Post Advert" },
  { href: "/reach-us", label: "Reach Us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-800">
          Talent<span className="text-primary-500">HQ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-6">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`hover:text-lime-500 transition-colors ${
                    pathname === href
                      ? "text-lime-500 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 border border-lime-500 text-primary-400 rounded hover:bg-blue-50 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-lime text-white rounded hover:bg-green-800 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
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
          <Link href="/" className="text-xl font-bold text-gray-800">
            TalentHQ
          </Link>
          <button onClick={toggleMenu}>
            <X size={28} />
          </button>
        </div>

        <ul className="flex flex-col space-y-6 p-6">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block text-lg hover:text-lime-500 transition-colors ${
                  pathname === href
                    ? "text-lime-500 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons Mobile */}
        <div className="px-6 mt-6 flex flex-col space-y-4">
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-center px-4 py-2 border border-lime-500 text-lime-800 rounded hover:bg-blue-50 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="text-center px-4 py-2 bg-lime-500 text-white rounded hover:bg-green-800 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
