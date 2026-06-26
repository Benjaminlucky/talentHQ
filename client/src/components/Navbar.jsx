"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, memo } from "react";
import { Menu, X, Zap, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/postjob", label: "Post Job" },
  { href: "/findjob", label: "Find Job" },
  { href: "/find-candidates", label: "Find Candidate" },
  { href: "/handymen", label: "Find Handymen" },
  { href: "/post-advert", label: "Post Advert" },
  { href: "/pricing", label: "Pricing", highlight: true },
  { href: "/reach-us", label: "Reach Us" },
];

const ROLE_DASH = {
  jobseeker: "/dashboard/jobseeker",
  handyman: "/dashboard/handyman",
  employer: "/dashboard/employer",
};

function NavbarComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const dashHref = user ? ROLE_DASH[user.role] || "/" : "/login";

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  // Desktop auth area: Login/Sign Up when logged out, Dashboard/Logout when in.
  const DesktopAuth = () => {
    // While the initial /me check is in flight, render nothing to avoid a
    // flash of the wrong buttons (Login flashing before Dashboard appears).
    if (loading) {
      return (
        <div className="flex items-center px-4">
          <Loader2 size={16} className="animate-spin text-gray-300" />
        </div>
      );
    }
    if (user) {
      return (
        <div className="flex space-x-3">
          <Link
            href={dashHref}
            prefetch
            onMouseEnter={() => router.prefetch(dashHref)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition"
          >
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      );
    }
    return (
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
    );
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo — desktop */}
        <Link href="/" prefetch className="flex items-center">
          <Image
            src="/talenthqWebsiteLogo.svg"
            alt="TalentHQ"
            width={140}
            height={36}
            priority
            style={{ width: "auto", height: "36px" }}
          />
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
          <DesktopAuth />
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden text-gray-700"
          aria-label="Toggle menu"
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
          {/* Logo — mobile */}
          <Link
            href="/"
            prefetch
            onClick={() => setMenuOpen(false)}
            className="flex items-center"
          >
            <Image
              src="/talenthqWebsiteLogo.svg"
              alt="TalentHQ"
              width={130}
              height={32}
              priority
              style={{ width: "auto", height: "32px" }}
            />
          </Link>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
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

        {/* Mobile auth area */}
        <div className="px-6 mt-4 flex flex-col space-y-3">
          {loading ? null : user ? (
            <>
              <Link
                href={dashHref}
                prefetch
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(NavbarComponent);
