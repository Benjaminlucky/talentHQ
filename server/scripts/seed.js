// server/scripts/seed.js
// Run: node scripts/seed.js
// Clears existing seed data and inserts fresh realistic Nigerian demo data.

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ── Import models ─────────────────────────────────────────────────────────────
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import JobModel from "../models/job.model.js";
import JobseekerApplication from "../models/JobseekerApplication.js";
import Skill from "../models/Skill.js";
import Workexperience from "../models/Workexperience.js";
import Education from "../models/Education.js";

const PASSWORD = await bcrypt.hash("Password123!", 10);

// ── Data ──────────────────────────────────────────────────────────────────────
const EMPLOYER_DATA = [
  {
    fullName: "Chukwuemeka Okafor",
    companyName: "Okafor Tech Solutions",
    email: "emeka@okafortech.ng",
    industry: "Technology",
    location: "Victoria Island, Lagos",
    companySize: "51-200",
    companyWebsite: "https://okafortech.ng",
    logo: "https://ui-avatars.com/api/?name=Okafor+Tech&background=004B23&color=CCFF33&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Amina Yusuf",
    companyName: "Yusuf & Associates Law Firm",
    email: "amina@yusuflaw.ng",
    industry: "Legal",
    location: "Wuse II, Abuja",
    companySize: "11-50",
    companyWebsite: "https://yusuflaw.ng",
    logo: "https://ui-avatars.com/api/?name=Yusuf+Law&background=1900FF&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Babatunde Adeyemi",
    companyName: "Lagos Fintech Hub",
    email: "tunde@lagosfintechhub.com",
    industry: "Finance",
    location: "Lekki Phase 1, Lagos",
    companySize: "51-200",
    companyWebsite: "https://lagosfintechhub.com",
    logo: "https://ui-avatars.com/api/?name=Lagos+Fintech&background=7FBA00&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Ngozi Eze",
    companyName: "Eze Healthcare Group",
    email: "ngozi@ezehealthcare.ng",
    industry: "Healthcare",
    location: "GRA, Port Harcourt",
    companySize: "201-500",
    companyWebsite: "https://ezehealthcare.ng",
    logo: "https://ui-avatars.com/api/?name=Eze+Health&background=e63946&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Ibrahim Musa",
    companyName: "Kano Agribusiness Ltd",
    email: "ibrahim@kanoagri.ng",
    industry: "Agriculture",
    location: "Nasarawa, Kano",
    companySize: "11-50",
    companyWebsite: "https://kanoagri.ng",
    logo: "https://ui-avatars.com/api/?name=Kano+Agri&background=2d6a4f&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Chioma Nwachukwu",
    companyName: "Nwachukwu Media & PR",
    email: "chioma@nwachukwumedia.com",
    industry: "Marketing",
    location: "Ikeja, Lagos",
    companySize: "1-10",
    companyWebsite: "https://nwachukwumedia.com",
    logo: "https://ui-avatars.com/api/?name=NW+Media&background=f4a261&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Emeka Okwu",
    companyName: "Okwu Construction Nigeria",
    email: "emeka@okwuconstruct.ng",
    industry: "Engineering",
    location: "Enugu",
    companySize: "201-500",
    companyWebsite: "https://okwuconstruct.ng",
    logo: "https://ui-avatars.com/api/?name=Okwu+Build&background=495057&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Hauwa Bello",
    companyName: "Bello EdTech Academy",
    email: "hauwa@belledtech.ng",
    industry: "Education",
    location: "Maitama, Abuja",
    companySize: "51-200",
    companyWebsite: "https://belledtech.ng",
    logo: "https://ui-avatars.com/api/?name=Bello+Ed&background=6a4c93&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Obinna Dike",
    companyName: "Dike Logistics & Supply",
    email: "obinna@dikelogistics.ng",
    industry: "Operations",
    location: "Apapa, Lagos",
    companySize: "51-200",
    companyWebsite: "https://dikelogistics.ng",
    logo: "https://ui-avatars.com/api/?name=Dike+Log&background=023e8a&color=ffffff&size=128&bold=true&rounded=true",
  },
  {
    fullName: "Folake Adesanya",
    companyName: "Adesanya Retail Group",
    email: "folake@adesanyaretail.ng",
    industry: "Sales",
    location: "Ibadan",
    companySize: "201-500",
    companyWebsite: "https://adesanyaretail.ng",
    logo: "https://ui-avatars.com/api/?name=Adesanya+Retail&background=c9184a&color=ffffff&size=128&bold=true&rounded=true",
  },
];

const HANDYMAN_DATA = [
  {
    fullName: "Musa Balogun",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=MusaBalogun&backgroundColor=b6e3f4&accessories=kurt&clothing=blazerShirt&top=shortHairShortFlat",
    email: "musa.balogun@gmail.com",
    trade: "Plumbing",
    yearsExperience: 8,
    location: "Surulere, Lagos",
    skills: ["Pipe fitting", "Leak repair", "Drainage systems"],
    bio: "Expert plumber with 8 years in residential and commercial pipe installations.",
  },
  {
    fullName: "Emeka Nwankwo",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=EmekaNwankwo&backgroundColor=d1d4f9&clothing=blazerSweater&top=shortHairShortCurly",
    email: "emeka.nwankwo@gmail.com",
    trade: "Electrical",
    yearsExperience: 12,
    location: "Wuse, Abuja",
    skills: ["Wiring", "Panel installation", "Generator maintenance"],
    bio: "COREN-certified electrician specialising in industrial and domestic wiring.",
  },
  {
    fullName: "Sunday Ade",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=SundayAde&backgroundColor=ffdfbf&clothing=hoodie&top=shortHairShortWaved",
    email: "sunday.ade@gmail.com",
    trade: "Carpentry",
    yearsExperience: 6,
    location: "Ojuelegba, Lagos",
    skills: ["Furniture making", "Cabinet installation", "Wood finishing"],
    bio: "Skilled carpenter producing high-quality bespoke furniture for homes and offices.",
  },
  {
    fullName: "Kelechi Obi",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=KelechiObi&backgroundColor=b6e3f4&clothing=graphicShirt&top=shortHairDreads01",
    email: "kelechi.obi@gmail.com",
    trade: "Tiling",
    yearsExperience: 5,
    location: "Rumuola, Port Harcourt",
    skills: ["Floor tiling", "Wall tiling", "Waterproofing"],
    bio: "Precision tiler delivering beautiful finishes for bathrooms and living spaces.",
  },
  {
    fullName: "Abdullahi Sani",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=AbdullahiSani&backgroundColor=c0aede&clothing=blazerShirt&top=shortHairShortFlat&facialHair=beardMedium",
    email: "abdullahi.sani@gmail.com",
    trade: "Painting",
    yearsExperience: 10,
    location: "Bauchi Road, Kano",
    skills: ["Interior painting", "Exterior painting", "Texture coating"],
    bio: "Professional painter with expertise in texture and decorative finishes.",
  },
  {
    fullName: "Chibuzo Eze",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=ChibuzoEze&backgroundColor=ffdfbf&clothing=hoodie&top=shortHairShortRound",
    email: "chibuzo.eze@gmail.com",
    trade: "Welding",
    yearsExperience: 9,
    location: "Aba, Abia State",
    skills: ["Arc welding", "Gate fabrication", "Steel structures"],
    bio: "Experienced welder fabricating gates, railings, and structural steel works.",
  },
  {
    fullName: "Taiwo Hassan",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=TaiwoHassan&backgroundColor=d1d4f9&clothing=blazerSweater&top=shortHairShortFlat",
    email: "taiwo.hassan@gmail.com",
    trade: "AC Repair",
    yearsExperience: 7,
    location: "Ikeja, Lagos",
    skills: ["AC installation", "Gas charging", "AC servicing"],
    bio: "Certified HVAC technician handling all brands of air conditioning systems.",
  },
  {
    fullName: "Ifeanyi Ogbonna",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=IfeanyiOgbonna&backgroundColor=b6e3f4&clothing=graphicShirt&top=shortHairDreads02",
    email: "ifeanyi.ogbonna@gmail.com",
    trade: "Generator Repair",
    yearsExperience: 11,
    location: "Onisha, Anambra",
    skills: ["Generator servicing", "Rewinding", "Fault diagnosis"],
    bio: "Generator specialist with expertise in Perkins, Mikano, and Elemax brands.",
  },
  {
    fullName: "Lawal Bature",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=LawalBature&backgroundColor=c0aede&clothing=blazerShirt&top=shortHairShortFlat&facialHair=beardLight",
    email: "lawal.bature@gmail.com",
    trade: "Masonry",
    yearsExperience: 14,
    location: "Kaduna",
    skills: ["Block laying", "Plastering", "Screeding"],
    bio: "Master mason with over 14 years building residential and commercial structures.",
  },
  {
    fullName: "Patrick Okon",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=PatrickOkon&backgroundColor=ffdfbf&clothing=hoodie&top=shortHairShortWaved",
    email: "patrick.okon@gmail.com",
    trade: "Electrical",
    yearsExperience: 4,
    location: "Calabar, Cross River",
    skills: ["Solar installation", "Inverter setup", "Domestic wiring"],
    bio: "Young and energetic electrician specialising in solar energy solutions.",
  },
];

const JOBSEEKER_DATA = [
  {
    fullName: "Adaeze Nwosu",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=AdaezeNwosu&backgroundColor=b6e3f4",
    email: "adaeze.nwosu@gmail.com",
    headline: "Senior React Developer | 5 yrs exp",
    tagline: "Building products that matter",
    location: { city: "Lekki", country: "Nigeria", area: "Phase 1" },
    phone: "08031234567",
    linkedin: "https://linkedin.com/in/adaezenwosu",
    github: "https://github.com/adaezenwosu",
    skills: [
      { name: "React", level: "Expert" },
      { name: "TypeScript", level: "Expert" },
      { name: "Node.js", level: "Intermediate" },
    ],
  },
  {
    fullName: "Tobiloba Adeleke",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=TobilobaAdeleke&backgroundColor=c0aede",
    email: "tobiloba.adeleke@gmail.com",
    headline: "Product Manager | Fintech & Payments",
    tagline: "Turning user problems into product solutions",
    location: { city: "Yaba", country: "Nigeria", area: "Lagos" },
    phone: "08041234567",
    linkedin: "https://linkedin.com/in/tobilobaadeleke",
    github: "",
    skills: [
      { name: "Product Strategy", level: "Expert" },
      { name: "Agile", level: "Expert" },
      { name: "SQL", level: "Intermediate" },
    ],
  },
  {
    fullName: "Chukwudi Okonkwo",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=ChukwudiOkonkwo&backgroundColor=d1d4f9",
    email: "chukwudi.okonkwo@gmail.com",
    headline: "DevOps Engineer | AWS Certified",
    tagline: "Automating everything, breaking nothing",
    location: { city: "Abuja", country: "Nigeria", area: "Garki" },
    phone: "08051234567",
    linkedin: "https://linkedin.com/in/chukwudiokonkwo",
    github: "https://github.com/chukwudokonkwo",
    skills: [
      { name: "AWS", level: "Expert" },
      { name: "Docker", level: "Expert" },
      { name: "Kubernetes", level: "Expert" },
    ],
  },
  {
    fullName: "Funmilayo Bankole",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=FunmilayoBankole&backgroundColor=ffd5dc",
    email: "funmilayo.bankole@gmail.com",
    headline: "UI/UX Designer | Figma Expert",
    tagline: "Designing with empathy, building with precision",
    location: { city: "Ibadan", country: "Nigeria", area: "Bodija" },
    phone: "08061234567",
    linkedin: "https://linkedin.com/in/funmilayobankole",
    github: "",
    skills: [
      { name: "Figma", level: "Expert" },
      { name: "UX Research", level: "Expert" },
      { name: "Prototyping", level: "Expert" },
    ],
  },
  {
    fullName: "Nnamdi Obiora",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=NnamdiObiora&backgroundColor=b6e3f4",
    email: "nnamdi.obiora@gmail.com",
    headline: "Backend Engineer | Python & Django",
    tagline: "Clean code, clean architecture",
    location: { city: "Enugu", country: "Nigeria", area: "GRA" },
    phone: "08071234567",
    linkedin: "https://linkedin.com/in/nnamdiobiora",
    github: "https://github.com/nnamdiobiora",
    skills: [
      { name: "Python", level: "Expert" },
      { name: "Django", level: "Expert" },
      { name: "PostgreSQL", level: "Expert" },
    ],
  },
  {
    fullName: "Hadiza Umar",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=HadizaUmar&backgroundColor=c0aede",
    email: "hadiza.umar@gmail.com",
    headline: "Data Analyst | Power BI & Excel",
    tagline: "Data tells a story — I help you read it",
    location: { city: "Kano", country: "Nigeria", area: "Nassarawa" },
    phone: "08081234567",
    linkedin: "https://linkedin.com/in/hadizaumar",
    github: "",
    skills: [
      { name: "Power BI", level: "Expert" },
      { name: "Excel", level: "Expert" },
      { name: "SQL", level: "Expert" },
    ],
  },
  {
    fullName: "Emeka Uchenna",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=EmekaUchenna&backgroundColor=ffdfbf",
    email: "emeka.uchenna@gmail.com",
    headline: "Full Stack Developer | MERN Stack",
    tagline: "From pixel to production",
    location: { city: "Port Harcourt", country: "Nigeria", area: "D-Line" },
    phone: "08091234567",
    linkedin: "https://linkedin.com/in/emekauchenna",
    github: "https://github.com/emekauchenna",
    skills: [
      { name: "MongoDB", level: "Expert" },
      { name: "Express.js", level: "Expert" },
      { name: "React", level: "Expert" },
    ],
  },
  {
    fullName: "Blessing Nkechi",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=BlessingNkechi&backgroundColor=ffd5dc",
    email: "blessing.nkechi@gmail.com",
    headline: "Digital Marketing Manager | SEO & Ads",
    tagline: "Growth through strategy, not just spend",
    location: { city: "Lagos", country: "Nigeria", area: "Ikeja" },
    phone: "08021234561",
    linkedin: "https://linkedin.com/in/blessingnkechi",
    github: "",
    skills: [
      { name: "SEO", level: "Expert" },
      { name: "Google Ads", level: "Expert" },
      { name: "Meta Ads", level: "Expert" },
    ],
  },
  {
    fullName: "Yakubu Ibrahim",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=YakubuIbrahim&backgroundColor=d1d4f9",
    email: "yakubu.ibrahim@gmail.com",
    headline: "Accountant | ICAN Certified",
    tagline: "Numbers don't lie — I make sure they don't",
    location: { city: "Kaduna", country: "Nigeria", area: "Barnawa" },
    phone: "08011234567",
    linkedin: "https://linkedin.com/in/yakubuibrahim",
    github: "",
    skills: [
      { name: "QuickBooks", level: "Expert" },
      { name: "Financial Reporting", level: "Expert" },
      { name: "Tax Compliance", level: "Expert" },
    ],
  },
  {
    fullName: "Sola Afolabi",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=SolaAfolabi&backgroundColor=b6e3f4",
    email: "sola.afolabi@gmail.com",
    headline: "Software Engineer | Mobile & Web",
    tagline: "Building the future, one commit at a time",
    location: { city: "Lagos", country: "Nigeria", area: "Surulere" },
    phone: "08011234568",
    linkedin: "https://linkedin.com/in/solaafolabi",
    github: "https://github.com/solaafolabi",
    skills: [
      { name: "Flutter", level: "Expert" },
      { name: "React Native", level: "Expert" },
      { name: "Firebase", level: "Intermediate" },
    ],
  },
];

const JOB_DESCRIPTIONS = {
  tech: {
    title: "Senior React Developer",
    description:
      "We are looking for a highly skilled Senior React Developer to join our growing engineering team. You will work on complex web applications, mentor junior developers, and collaborate with product and design teams to deliver high-quality software solutions.",
    responsibilities:
      "Build reusable React components, Review code from junior engineers, Collaborate with backend team on API design, Optimise application performance, Participate in sprint planning and retrospectives",
    qualification:
      "B.Sc. Computer Science or related field, 4+ years React experience",
    skills: "React, TypeScript, Redux, REST APIs, Git",
    benefits:
      "Health insurance, Remote work option, Annual performance bonus, Professional development budget",
    salary: "250,000 – 450,000",
    experienceLevel: "4–6 years",
    category: "Technology",
    type: "Full-time",
    jobFor: "professional",
  },
  finance: {
    title: "Senior Accountant",
    description:
      "Eze Healthcare Group is seeking a detail-oriented Senior Accountant to manage financial records, prepare tax filings, and provide strategic financial insights to support business growth across our clinic network.",
    responsibilities:
      "Prepare monthly financial statements, Manage payroll processing, Handle FIRS tax compliance, Conduct internal audits, Oversee accounts payable and receivable",
    qualification: "B.Sc. Accounting, ACA or ACCA certification required",
    skills: "QuickBooks, IFRS, Tax Compliance, Financial Reporting, Excel",
    benefits: "HMO for staff and family, Housing allowance, Annual leave bonus",
    salary: "180,000 – 280,000",
    experienceLevel: "2–4 years",
    category: "Accounting",
    type: "Full-time",
    jobFor: "professional",
  },
  marketing: {
    title: "Digital Marketing Manager",
    description:
      "Nwachukwu Media is hiring an experienced Digital Marketing Manager to lead campaigns for our portfolio of FMCG and lifestyle clients. You will own strategy, execution, and reporting across all paid and organic channels.",
    responsibilities:
      "Develop and execute digital marketing strategies, Manage Google and Meta ad campaigns, Oversee SEO and content calendar, Report performance to clients monthly, Manage a team of two junior marketers",
    qualification:
      "B.Sc. Marketing or Communications, Google Ads certification preferred",
    skills: "Google Ads, Meta Ads, SEO, Content Marketing, Analytics",
    benefits:
      "Flexible working hours, Commission on new clients, Training budget",
    salary: "150,000 – 250,000",
    experienceLevel: "2–4 years",
    category: "Marketing",
    type: "Full-time",
    jobFor: "professional",
  },
  plumbing: {
    title: "Residential Plumber",
    description:
      "Okwu Construction Nigeria requires an experienced plumber for multiple residential estate projects in Enugu. Work includes full pipe installation, bathroom fittings, and drainage systems for new builds.",
    responsibilities:
      "Install water supply and drainage systems, Fit bathroom and kitchen plumbing, Diagnose and repair leaks, Read and interpret technical drawings, Ensure compliance with building codes",
    qualification:
      "Trade certificate in plumbing, minimum 3 years site experience",
    skills:
      "Pipe fitting, Drainage systems, Bathroom installation, Leak detection",
    benefits: "Transport allowance, Accommodation on site, Tools provided",
    salary: "80,000 – 120,000",
    experienceLevel: "2–4 years",
    category: "Plumbing",
    type: "Contract",
    jobFor: "handyman",
  },
  electrical: {
    title: "Site Electrician",
    description:
      "Okwu Construction Nigeria is recruiting qualified electricians for commercial building projects. You will handle all electrical installations from conduit to final connections, ensuring compliance with Nigerian Electrical Standards.",
    responsibilities:
      "Install electrical conduits and wiring, Fit distribution boards and MCBs, Test and commission electrical systems, Maintain safe working practices, Liaise with site manager on progress",
    qualification:
      "City & Guilds or NABTEB certificate in Electrical Installation, 3+ years construction experience",
    skills:
      "Wiring, Panel installation, Conduit work, Testing and commissioning",
    benefits:
      "PPE provided, Daily transport, Performance bonus on project completion",
    salary: "90,000 – 140,000",
    experienceLevel: "2–4 years",
    category: "Electrical",
    type: "Contract",
    jobFor: "handyman",
  },
};

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  // ── Wipe existing seed data by email (works even before isSeed field exists on models)
  console.log("🗑  Clearing previous seed data...");

  const EMPLOYER_EMAILS = EMPLOYER_DATA.map((e) => e.email);
  const HANDYMAN_EMAILS = HANDYMAN_DATA.map((h) => h.email);
  const JOBSEEKER_EMAILS = JOBSEEKER_DATA.map((j) => j.email);

  // Find existing seed users so we can cascade-delete their skills/work/education
  const oldJobseekers = await Jobnode.find({ email: { $in: JOBSEEKER_EMAILS } })
    .select("_id")
    .lean();
  const oldJsIds = oldJobseekers.map((j) => j._id);

  await Promise.all([
    // Delete by known seed emails — safe, never touches real users
    Employer.deleteMany({ email: { $in: EMPLOYER_EMAILS } }),
    Handyman.deleteMany({ email: { $in: HANDYMAN_EMAILS } }),
    Jobnode.deleteMany({ email: { $in: JOBSEEKER_EMAILS } }),
    // Cascade-delete profile sub-documents belonging to those jobseekers
    Skill.deleteMany({ user: { $in: oldJsIds } }),
    Workexperience.deleteMany({ user: { $in: oldJsIds } }),
    Education.deleteMany({ user: { $in: oldJsIds } }),
    // Delete seed jobs and applications (isSeed flag OR all — safe since DB is dev/test)
    JobModel.deleteMany({ $or: [{ isSeed: true }, { postedBy: "employer" }] }),
    JobseekerApplication.deleteMany({ isSeed: true }),
  ]);
  console.log("✅ Previous seed data cleared");

  // ── Create Employers ──────────────────────────────────────────────────────
  console.log("👔 Creating 10 employers...");
  const employers = [];
  for (const e of EMPLOYER_DATA) {
    const emp = await Employer.create({
      ...e,
      password: PASSWORD,
      emailVerified: true,
      onboardingComplete: true,
      companyLinkedin: `https://linkedin.com/company/${e.companyName.toLowerCase().replace(/\s+/g, "-")}`,
      phone: `080${Math.floor(10000000 + Math.random() * 89999999)}`,
      logo: e.logo,
      isSeed: true,
    });
    employers.push(emp);
    process.stdout.write(".");
  }
  console.log("\n✅ 10 employers created");

  // ── Create Handymen ───────────────────────────────────────────────────────
  console.log("🔧 Creating 10 handymen...");
  const handymen = [];
  for (const h of HANDYMAN_DATA) {
    const hm = await Handyman.create({
      fullName: h.fullName,
      email: h.email,
      password: PASSWORD,
      trade: h.trade,
      yearsExperience: h.yearsExperience,
      location: h.location,
      skills: h.skills,
      bio: h.bio,
      avatar: h.avatar,
      phone: `080${Math.floor(10000000 + Math.random() * 89999999)}`,
      emailVerified: true,
      onboardingComplete: true,
      isSeed: true,
    });
    handymen.push(hm);
    process.stdout.write(".");
  }
  console.log("\n✅ 10 handymen created");

  // ── Create Jobseekers with Skills, Work Experience, Education ─────────────
  console.log("👤 Creating 10 jobseekers with full profiles...");
  const jobseekers = [];
  for (const j of JOBSEEKER_DATA) {
    const js = await Jobnode.create({
      fullName: j.fullName,
      email: j.email,
      password: PASSWORD,
      headline: j.headline,
      tagline: j.tagline,
      location: j.location,
      phone: j.phone,
      linkedin: j.linkedin,
      github: j.github,
      avatar: j.avatar,
      emailVerified: true,
      onboardingComplete: true,
      isSeed: true,
    });

    // Skills
    for (const s of j.skills) {
      const skill = await Skill.create({
        user: js._id,
        name: s.name,
        level: s.level,
        isSeed: true,
      });
      js.skill.push(skill._id);
    }

    // Work Experience
    const we = await Workexperience.create({
      user: js._id,
      jobTitle: j.headline.split("|")[0].trim(),
      company:
        EMPLOYER_DATA[Math.floor(Math.random() * EMPLOYER_DATA.length)]
          .companyName,
      startDate: new Date("2021-03-01"),
      endDate: null,
      description: `Lead developer responsible for building and maintaining core platform features. Collaborated with cross-functional teams to deliver features on time.`,
      isSeed: true,
    });
    js.workExperience.push(we._id);

    // Education
    const edu = await Education.create({
      user: js._id,
      degree: "B.Sc. Computer Science",
      institution: [
        "University of Lagos",
        "Obafemi Awolowo University",
        "University of Ibadan",
        "Ahmadu Bello University",
        "University of Nigeria Nsukka",
      ][Math.floor(Math.random() * 5)],
      graduationYear: 2018 + Math.floor(Math.random() * 4),
      isSeed: true,
    });
    js.education.push(edu._id);
    await js.save();
    jobseekers.push(js);
    process.stdout.write(".");
  }
  console.log("\n✅ 10 jobseekers created");

  // ── Create Jobs (5 professional, 5 handyman) ──────────────────────────────
  console.log("💼 Creating 10 jobs...");
  const jobTemplates = [
    { ...JOB_DESCRIPTIONS.tech, state: "Lagos", lga: "Eti-Osa" },
    { ...JOB_DESCRIPTIONS.finance, state: "Rivers", lga: "Port Harcourt" },
    { ...JOB_DESCRIPTIONS.marketing, state: "Lagos", lga: "Ikeja" },
    {
      title: "Product Designer",
      description:
        "Join our product team to craft intuitive user experiences for our B2B SaaS platform used by thousands of Nigerian businesses.",
      responsibilities:
        "Design wireframes and prototypes, Conduct user research, Collaborate with engineers, Maintain design system",
      qualification: "3+ years UI/UX experience, Figma proficiency",
      skills: "Figma, UX Research, Prototyping, Design Systems",
      benefits: "Fully remote, Health insurance, Learning budget",
      salary: "200,000 – 350,000",
      experienceLevel: "2–4 years",
      category: "Design",
      type: "Full-time",
      jobFor: "professional",
      state: "Lagos",
      lga: "Lekki",
    },
    {
      title: "DevOps Engineer",
      description:
        "We are scaling our infrastructure rapidly and need an experienced DevOps engineer to ensure reliability, performance, and security of our cloud systems.",
      responsibilities:
        "Manage AWS infrastructure, Set up CI/CD pipelines, Monitor system performance, Implement security best practices, Automate deployments",
      qualification: "B.Sc. Engineering, AWS certification preferred",
      skills: "AWS, Docker, Kubernetes, Terraform, GitHub Actions",
      benefits: "Remote-first, Equity options, Annual training budget",
      salary: "300,000 – 500,000",
      experienceLevel: "4–6 years",
      category: "Technology",
      type: "Full-time",
      jobFor: "professional",
      state: "Abuja",
      lga: "Maitama",
    },
    { ...JOB_DESCRIPTIONS.plumbing, state: "Enugu", lga: "Enugu North" },
    { ...JOB_DESCRIPTIONS.electrical, state: "Enugu", lga: "Enugu South" },
    {
      title: "Painter — Estate Project",
      description:
        "Adesanya Retail Group requires experienced painters for a large-scale painting project across 3 commercial properties in Ibadan.",
      responsibilities:
        "Prepare surfaces for painting, Apply paint and sealants, Match colours to specification, Ensure clean finishing, Complete work to schedule",
      qualification: "Minimum 3 years painting experience on commercial sites",
      skills:
        "Interior painting, Exterior painting, Surface preparation, Colour matching",
      benefits: "Accommodation provided, Daily transport, Completion bonus",
      salary: "70,000 – 100,000",
      experienceLevel: "2–4 years",
      category: "Painting",
      type: "Contract",
      jobFor: "handyman",
      state: "Oyo",
      lga: "Ibadan North",
    },
    {
      title: "AC Installation Technician",
      description:
        "Lagos Fintech Hub is refitting its new office space and requires a skilled AC technician to install and commission 20+ split AC units across the building.",
      responsibilities:
        "Install split AC units, Charge refrigerant gas, Commission and test units, Train staff on basic operation, Provide after-installation support",
      qualification:
        "Certified HVAC technician, 3+ years AC installation experience",
      skills:
        "AC installation, Gas charging, Electrical wiring, Troubleshooting",
      benefits:
        "Materials provided, Performance bonus per unit, Weekend premium",
      salary: "100,000 – 150,000",
      experienceLevel: "2–4 years",
      category: "AC Repair",
      type: "Contract",
      jobFor: "handyman",
      state: "Lagos",
      lga: "Eti-Osa",
    },
    {
      title: "Welder — Gate & Security Fabrication",
      description:
        "Kano Agribusiness Ltd needs an experienced welder to fabricate and install security gates and window grilles for our new processing facility.",
      responsibilities:
        "Fabricate steel gates and grilles, Install window protectors, Weld structural steel frames, Ensure all welds meet safety standards, Coordinate with site team",
      qualification:
        "Trade certificate in welding, 4+ years fabrication experience",
      skills:
        "Arc welding, Gate fabrication, Steel structures, Blueprint reading",
      benefits: "Tools provided, Accommodation on site, Completion bonus",
      salary: "85,000 – 130,000",
      experienceLevel: "4–6 years",
      category: "Welding",
      type: "Contract",
      jobFor: "handyman",
      state: "Kano",
      lga: "Nassarawa",
    },
  ];

  const jobs = [];
  for (let i = 0; i < jobTemplates.length; i++) {
    const tmpl = jobTemplates[i];
    const employer = employers[i % employers.length];
    const job = await JobModel.create({
      ...tmpl,
      location: employer.location || `${tmpl.lga || ""}, ${tmpl.state}`,
      address: `${i + 1} Business District, ${employer.location}`,
      phoneNumber: employer.phone,
      company: employer._id,
      postedBy: "employer",
      deadline: new Date(Date.now() + (14 + i * 3) * 24 * 60 * 60 * 1000),
      isSeed: true,
    });
    jobs.push(job);
    process.stdout.write(".");
  }
  console.log("\n✅ 10 jobs created");

  // ── Create Applications ───────────────────────────────────────────────────
  console.log("📋 Creating 10 applications...");
  const coverLetters = [
    "I am excited to apply for this position. With my extensive background in technology and a proven track record of delivering high-quality software, I am confident I would be a strong addition to your team. I thrive in collaborative environments and am passionate about building scalable, maintainable systems.",
    "Your company's reputation for innovation and your mission to transform the Nigerian tech landscape resonate deeply with me. I have spent the last 4 years honing my skills specifically for roles like this, and I believe my experience at my previous employer has prepared me well for the challenges ahead.",
    "After researching your organisation thoroughly, I am convinced that my skill set aligns perfectly with what you are looking for. I bring not just technical expertise but also strong communication and problem-solving abilities that will allow me to hit the ground running.",
    "I was recommended to apply by a mutual connection who spoke highly of your company culture and growth opportunities. With over 5 years of relevant experience and a series of successful projects under my belt, I am ready to bring that same level of excellence to your team.",
    "This role represents exactly the next step I have been looking for in my career. I am eager to take on more responsibility and leadership, and I believe your organisation provides the ideal environment to do so. My technical skills combined with my passion for mentorship make me a well-rounded candidate.",
    "I am applying with great enthusiasm for this opportunity. My background in product management has given me a unique perspective that bridges technical and business needs, and I have consistently delivered measurable results — increasing team velocity by 35% at my last role.",
    "Having built my expertise over the past 6 years, I am now looking for a company where I can make a meaningful impact. Your focus on using technology to solve real Nigerian problems is exactly the kind of mission I want to contribute to.",
    "I am a detail-oriented professional with a passion for excellence. Every project I have worked on has been delivered on time and within budget, and I take great pride in maintaining high standards of work. I would bring that same commitment to your organisation.",
    "As a self-driven professional with a strong network in the industry, I am confident in my ability to make an immediate impact. My approach combines strategic thinking with hands-on execution, and I am excited about the possibility of joining your team.",
    "Your job posting caught my attention because it aligns perfectly with my career goals and current skill set. I would welcome the opportunity to discuss how my background in this field can help your team achieve its objectives for the coming year.",
  ];

  const statuses = [
    "pending",
    "pending",
    "pending",
    "reviewed",
    "reviewed",
    "reviewed",
    "accepted",
    "accepted",
    "rejected",
    "rejected",
  ];
  const employerMessages = [
    "",
    "",
    "",
    "We have reviewed your application and are impressed with your background.",
    "",
    "Your profile looks great — we would like to schedule an interview.",
    "Congratulations! We are pleased to offer you this position. Please expect a formal offer letter via email.",
    "Excellent application — welcome to the team!",
    "Thank you for applying. Unfortunately, we are moving forward with other candidates at this time.",
    "We appreciate your interest but have decided to go with a candidate with more industry-specific experience.",
  ];

  for (let i = 0; i < 10; i++) {
    const jobseeker = jobseekers[i];
    const job = jobs[i % jobs.length];
    const status = statuses[i];
    await JobseekerApplication.create({
      jobseeker: jobseeker._id,
      roleTitle: job.title,
      roleType: job.type === "Full-time" ? "full-time role" : "contract",
      preferredLocation: `${job.location} (Open to remote)`,
      coverLetter: coverLetters[i],
      portfolioLinks: jobseeker.github
        ? [jobseeker.github, jobseeker.linkedin].filter(Boolean)
        : [],
      status,
      employerMessage: employerMessages[i],
      resumeAvailable: true,
      isSeed: true,
    });
    process.stdout.write(".");
  }
  console.log("\n✅ 10 applications created");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────");
  console.log(`👔 Employers:     10   (password: Password123!)`);
  console.log(`🔧 Handymen:      10   (password: Password123!)`);
  console.log(`👤 Jobseekers:    10   (password: Password123!)`);
  console.log(`💼 Jobs:          10   (5 professional, 5 handyman)`);
  console.log(`📋 Applications:  10   (mix of statuses)`);
  console.log("─────────────────────────────────────────────");
  console.log("All accounts use password: Password123!");
  console.log("Employers can log in at /login");
  console.log("Example jobseeker: adaeze.nwosu@gmail.com");
  console.log("Example employer:  emeka@okafortech.ng");
  console.log("Example handyman:  musa.balogun@gmail.com");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
