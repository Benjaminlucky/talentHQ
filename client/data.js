import { TbLayoutDashboardFilled } from "react-icons/tb";
import { GrOrganization } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";
import { IoMdLogOut } from "react-icons/io";
import { MdEditDocument } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaFolder } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { FaUserAlt } from "react-icons/fa";
import { IoDocumentSharp } from "react-icons/io5";
import { FaMoneyBill } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import {
  MdDashboard,
  MdWork,
  MdReport,
  MdCampaign,
  MdVerifiedUser,
  MdBarChart,
} from "react-icons/md";
import { FiUsers, FiSettings } from "react-icons/fi";

import { Children } from "react";

export const featuredJobs = [
  {
    id: 1,
    title: " Senior UI Designer",
    company: "Microsoft",
    companyLogo: "/assets/microsoft.png",
    brief: "Design and implement user interfaces for web applications.",
    location: "Lagos, Nigeria",
    mode: "Full-time",
    salary: "₦400K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 2,
    title: "Senior Software Engineer",
    company: "Google",
    companyLogo: "/assets/google.png",
    brief: "Develop and maintain scalable web applications.",
    location: "Abuja, Nigeria",
    mode: "Part-time",
    salary: "₦300K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 3,
    title: "Product Manager",
    company: "Amazon",
    companyLogo: "/assets/amazon.png",
    brief: "Lead product development and strategy.",
    location: "Remote",
    mode: "Contract",
    salary: "₦500K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Facebook",
    companyLogo: "/assets/facebook.png",
    brief: "Analyze data to drive business decisions.",
    location: "Lagos, Nigeria",
    mode: "Internship",
    salary: "₦200K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "Twitter",
    companyLogo: "/assets/twitter.avif",
    brief: "Develop and execute marketing strategies.",
    location: "Remote",
    mode: "Freelance",
    salary: "₦350K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 6,
    title: "UX Researcher",
    company: "LinkedIn",
    companyLogo: "/assets/linkedin.png",
    brief: "Conduct user research to inform design decisions.",
    location: "Abuja, Nigeria",
    mode: "Full-time",
    salary: "₦450K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 7,
    title: "DevOps Engineer",
    company: "IBM",
    companyLogo: "/assets/ibm.webp",
    brief: "Manage and optimize cloud infrastructure.",
    location: "Remote",
    mode: "Part-time",
    salary: "₦400K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 8,
    title: "Content Writer",
    company: "Adobe",
    companyLogo: "/assets/adobe.png",
    brief: "Create and edit content for various platforms.",
    location: "Lagos, Nigeria",
    mode: "Internship",
    salary: "₦250K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 9,
    title: "Sales Executive",
    company: "Salesforce",
    companyLogo: "/assets/salesforce.png",
    brief: "Drive sales and build client relationships.",
    location: "Remote",
    mode: "Freelance",
    salary: "₦300K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    benefits: [
      "Health Insurance",
      "Retirement Plan",
      "Paid Time Off",
      "Professional Development Opportunities",
    ],
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
  {
    id: 10,
    title: "Graphic Designer",
    company: "Canva",
    companyLogo: "/assets/canva.png",
    brief: "Create visual content for marketing and branding.",
    location: "Abuja, Nigeria",
    mode: "Full-time",
    salary: "₦350K",
    time: "Monthly",
    qualification: "BSc. Computer Science",
    skills: ["User Experience", "System Design", "Wireframing", "Photoshop"],
    detailedBrief:
      "Datadock.AI is seeking a motivated Junior Data Engineer to support the work of our data science team. In this role, you will help build and maintain efficient data pipelines and systems that enable seamless data analysis and insights generation. You'll work closely with team members to ensure the solutions you develop align with project goals and organizational requirements.To ensure success as a data engineer, you should be able to design, build, operationalize, secure, and monitor data processing systems with a particular emphasis on security and compliance; scalability and efficiency; reliability and fidelity; and flexibility and portability as well as leverage, deploy, and continuously train pre-existing machine learning models.What You’ll Be Doing: Data Engineer Job Responsibilities:",
  },
];

export const featuredCandidates = [
  {
    id: 1,
    role: "Chartered Accountant",
    name: "Adebayo Ohiri",
    brief: "Experienced in financial analysis and reporting.",
    location: "Lekki, Lagos",
    qualification: "ICAN Certified",
    avatar: "/assets/adebayo.avif",
  },
  {
    id: 2,
    role: "Software Engineer",
    name: "Chinonso Okeke",
    brief: "Proficient in JavaScript and Python.",
    location: "Victoria Island, Lagos",
    qualification: "BSc Computer Science",
    avatar: "/assets/chinonso.avif",
  },
  {
    id: 3,
    role: "Digital Marketer",
    name: "Fatima Bello",
    brief: "Expert in SEO and content marketing.",
    location: "Ikeja, Lagos",
    qualification: "Google Certified",
    avatar: "/assets/fatima.avif",
  },
  {
    id: 4,
    role: "Data Scientist",
    name: "Emeka Nwosu",
    brief: "Skilled in machine learning and data analysis.",
    location: "Abuja, Nigeria",
    qualification: "MSc Data Science",
    avatar: "/assets/emeka.avif",
  },
  {
    id: 5,
    role: "UX/UI Designer",
    name: "Tolu Adebayo",
    brief: "Passionate about user-centered design.",
    location: "Port Harcourt, Nigeria",
    qualification: "BSc Graphic Design",
    avatar: "/assets/tolu.avif",
  },
  {
    id: 6,
    role: "Project Manager",
    name: "Sarah Johnson",
    brief: "Experienced in Agile project management.",
    location: "Remote",
    qualification: "PMP Certified",
    avatar: "/assets/sarah.avif",
  },
  {
    id: 7,
    role: "Content Writer",
    name: "John Doe",
    brief: "Creative writer with a knack for storytelling.",
    location: "Lagos, Nigeria",
    qualification: "BA English Literature",
    avatar: "/assets/john.avif",
  },
  {
    id: 8,
    role: "Sales Executive",
    name: "Jane Smith",
    brief: "Proven track record in sales and client relations.",
    location: "Abuja, Nigeria",
    qualification: "BSc Business Administration",
    avatar: "/assets/jane.avif",
  },
  {
    id: 9,
    role: "Graphic Designer",
    name: "Michael Brown",
    brief: "Expert in Adobe Creative Suite.",
    location: "Ikeja, Lagos",
    qualification: "Diploma in Graphic Design",
    avatar: "/assets/michael.avif",
  },
  {
    id: 10,
    role: "Web Developer",
    name: "Olivia Williams",
    brief: "Full-stack developer with a passion for coding.",
    location: "Remote",
    qualification: "BSc Software Engineering",
    avatar: "/assets/olivia.avif",
  },
];

export const handymanCandidates = [
  {
    id: 1,
    role: "Plumber",
    name: "Samuel Eze",
    brief:
      "Specialist in residential and commercial plumbing with 8+ years experience.",
    location: "Yaba, Lagos",
    specialization: "Pipe fittings, Leak repairs, Water heater installation",
    avatar: "/assets/chinonso.avif",
  },
  {
    id: 2,
    role: "Tiler",
    name: "Kelechi Obi",
    brief: "Expert tiler with a keen eye for detail and clean finishes.",
    location: "Enugu, Nigeria",
    specialization: "Ceramic, Marble & Mosaic Tiling",
    avatar: "/assets/john.avif",
  },
  {
    id: 3,
    role: "Electrician",
    name: "Ibrahim Yusuf",
    brief:
      "Licensed electrician with hands-on experience in wiring and maintenance.",
    location: "Abuja, Nigeria",
    specialization: "Residential & Commercial Installations",
    certification: "NABTEB Certified",
    avatar: "/assets/michael.avif",
  },
  {
    id: 4,
    role: "Painter",
    name: "Sunday Ade",
    brief:
      "Professional painter delivering quality finishes and fast turnaround.",
    location: "Benin City, Nigeria",
    specialization: "Interior & Exterior Painting, POP Finishes",
    avatar: "/assets/fatima.avif",
  },
  {
    id: 5,
    role: "Welder",
    name: "Musa Danjuma",
    brief:
      "Experienced in iron welding for gates, doors and structural frameworks.",
    location: "Kaduna, Nigeria",
    specialization: "Arc & Gas Welding",
    avatar: "/assets/adebayo.avif",
  },
];

export const nigeriaStatesWithLGAs = [
  {
    Abia: ["Aba North", "Aba South", "Arochukwu", "Bende", "Isiala-Ngwa North"],
    Adamawa: ["Demsa", "Fufore", "Ganye", "Girei", "Gombi"],
    Lagos: ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa"],
    FCT: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal"],
  },
];

export const jobseekerDashNav = [
  {
    item: "Dashboard",
    icon: TbLayoutDashboardFilled,
    link: "/dashboard-handyman",
  },
  {
    item: "Browse Jobs",
    icon: FaMagnifyingGlass,
    link: "/dashboard-handyman/browse-jobs",
  },
  {
    item: "My Applications",
    icon: MdEditDocument,
    link: "/dashboard-handyman/my-applications",
  },
  {
    item: "My Jobs",
    icon: FaFolder,
    link: "/dashboard-handyman/my-jobs",
  },
  {
    item: "Saved Jobs",
    icon: FaSave,
    link: "/dashboard-handyman/saved-jobs",
  },
  {
    item: "Messages / Chats",
    icon: AiFillMessage,
    link: "/dashboard-handyman/messages",
  },
  {
    item: "Profile",
    icon: FaUserAlt,
    link: "/dashboard-handyman/profile",
  },
  {
    item: "Resume Builder",
    icon: IoDocumentSharp,
    link: "/dashboard-handyman/resume-builder",
  },
  {
    item: "Settings",
    icon: IoMdSettings,
    link: "/dashboard-handyman/settings",
  },
  {
    item: "Log Out",
    icon: IoMdLogOut,
    link: "/",
  },
];
export const handymanDashNav = [
  {
    item: "Dashboard",
    icon: TbLayoutDashboardFilled,
    link: "/dashboard-handyman",
  },
  {
    item: "Browse Jobs",
    icon: FaMagnifyingGlass,
    link: "/dashboard-handyman/browse-jobs",
  },
  {
    item: "My Applications",
    icon: MdEditDocument,
    link: "/dashboard-handyman/my-applications",
  },
  {
    item: "My Jobs",
    icon: FaFolder,
    link: "/dashboard-handyman/my-jobs",
  },
  {
    item: "Messages / Chats",
    icon: AiFillMessage,
    link: "/dashboard-handyman/messages",
  },
  {
    item: "Earnings",
    icon: FaMoneyBill,
    link: "/dashboard-handyman/earnings",
  },
  {
    item: "Profile",
    icon: FaUserAlt,
    link: "/dashboard-handyman/profile",
  },

  {
    item: "Settings",
    icon: IoMdSettings,
    link: "/dashboard-handyman/settings",
  },
  {
    item: "Log Out",
    icon: IoMdLogOut,
    link: "/",
  },
];
export const employerDashNav = [
  {
    item: "Dashboard",
    icon: TbLayoutDashboardFilled,
    link: "/dashboard-employer",
  },

  {
    item: "Job Posts Manager",
    icon: FaFolder,
    link: "/dashboard-handyman/job-posts-manager",
  },
  {
    item: "Post New Job",
    icon: MdEditDocument,
    link: "/dashboard-handyman/post-new-job",
  },
  {
    item: "Browse Candidates",
    icon: FaMagnifyingGlass,
    link: "/dashboard-handyman/browse-candidates",
  },
  {
    item: "Shortlisted Candidates",
    icon: FaBookmark,
    link: "/dashboard-handyman/shortlisted-candidates",
  },
  {
    item: "Messages / Chats",
    icon: AiFillMessage,
    link: "/dashboard-handyman/messages",
  },

  {
    item: "Company Profile Settings",
    icon: GrOrganization,
    link: "/dashboard-handyman/profile",
  },

  {
    item: "Log Out",
    icon: IoMdLogOut,
    link: "/",
  },
];

export const superAdminMenu = [
  {
    title: "Dashboard",
    icon: <MdDashboard />,
    path: "/admin/dashboard",
  },
  {
    title: "Users",
    icon: <FiUsers />,
    children: [
      {
        title: "All Users",
        path: "/admin/users/all",
      },
      {
        title: "Employers",
        path: "/admin/users/employers",
      },
      {
        title: "Handymen",
        path: "/admin/users/handymen",
      },
      {
        title: "Jobseekers",
        path: "/admin/users/jobseekers",
      },
    ],
  },
  {
    title: "Jobs",
    icon: <MdWork />,
    children: [
      {
        title: "All Jobs",
        path: "/admin/jobs/all",
      },
      {
        title: "Pending Approvals",
        path: "/admin/jobs/pending",
      },
      {
        title: "Reported Jobs",
        path: "/admin/jobs/reported",
      },
    ],
  },
  {
    title: "Employer Verification",
    icon: <MdVerifiedUser />,
    path: "/admin/employer-verification",
  },
  {
    title: "Reports",
    icon: <MdReport />,
    children: [
      {
        title: "Reported Users",
        path: "/admin/reports/users",
      },
      {
        title: "Reported Jobs",
        path: "/admin/reports/jobs",
      },
    ],
  },
  {
    title: "Announcements",
    icon: <MdCampaign />,
    path: "/admin/announcements",
  },
  {
    title: "Statistics",
    icon: <MdBarChart />,
    children: [
      {
        title: "User Analytics",
        path: "/admin/stats/users",
      },
      {
        title: "Job Analytics",
        path: "/admin/stats/jobs",
      },
    ],
  },
  {
    title: "Settings",
    icon: <FiSettings />,
    children: [
      {
        title: "Profile Settings",
        path: "/admin/settings/profile",
      },
      {
        title: "Security",
        path: "/admin/settings/security",
      },
    ],
  },
];
