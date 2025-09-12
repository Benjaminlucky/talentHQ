"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = {
    jobseeker: [
      { href: "/dashboard/jobseeker", label: "Overview" },
      { href: "/dashboard/jobseeker/applications", label: "Applications" },
      { href: "/dashboard/jobseeker/profile", label: "My Profile" },
    ],
    handyman: [
      { href: "/dashboard/handyman", label: "Overview" },
      { href: "/dashboard/handyman/jobs", label: "Jobs" },
    ],
    employer: [
      { href: "/dashboard/employer", label: "Overview" },
      { href: "/dashboard/employer/post-job", label: "Post a Job" },
    ],
    admin: [
      { href: "/dashboard/admin", label: "Overview" },
      { href: "/dashboard/admin/users", label: "Manage Users" },
    ],
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Backdrop (mobile only) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-md p-4 flex flex-col justify-between z-50 md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">TalentHQ</h2>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {user?.role &&
                navItems[user.role]?.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md ${
                      pathname === item.href
                        ? "bg-lime-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>

            {/* User menu */}
            {user && (
              <div className="border-t pt-4 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r shadow-md p-4 justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">TalentHQ</h2>
          <nav className="space-y-2">
            {user?.role &&
              navItems[user.role]?.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md ${
                    pathname === item.href
                      ? "bg-lime-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>

        {user && (
          <div className="border-t pt-4 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-gray-500" />
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
