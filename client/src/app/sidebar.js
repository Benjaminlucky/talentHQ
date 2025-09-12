// sidebarConfig.js
export const sidebarConfig = {
  jobseeker: [
    { label: "Dashboard", href: "/dashboard", icon: "Home" },
    {
      label: "My Applications",
      href: "/dashboard/applications",
      icon: "ClipboardList",
    },
    { label: "Profile", href: "/dashboard/profile", icon: "User" },
  ],
  employer: [
    { label: "Dashboard", href: "/dashboard", icon: "Home" },
    { label: "Post Job", href: "/dashboard/post-job", icon: "PlusCircle" },
    { label: "Candidates", href: "/dashboard/candidates", icon: "Users" },
  ],
  handyman: [
    { label: "Dashboard", href: "/dashboard", icon: "Home" },
    { label: "My Services", href: "/dashboard/services", icon: "Wrench" },
  ],
};
