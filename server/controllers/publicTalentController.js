// controllers/publicTalentController.js
// PUBLIC, additive endpoint. Lists onboarded jobseekers so they are
// discoverable on /find-candidates and indexable for SEO — independent of
// whether they have submitted a job application. Does not modify or depend on
// the Applications flow.
import Jobnode from "../models/Jobnode.js";

// Format the Jobnode location object into a flat string for display.
function locString(loc) {
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  return [loc.city, loc.area, loc.country].filter(Boolean).join(", ");
}

// ── GET /api/jobseekers — public, paginated, searchable ───────────────────────
export const getPublicJobseekers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", location = "" } = req.query;

    // Only show profiles that finished onboarding (have a usable public profile).
    const query = { onboardingComplete: true };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { headline: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
      ];
    }
    if (location) {
      query.$or = [
        ...(query.$or || []),
        { "location.city": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } },
        { "location.area": { $regex: location, $options: "i" } },
      ];
    }

    const [docs, total] = await Promise.all([
      Jobnode.find(query)
        // PUBLIC select — never expose email or other PII.
        .select("fullName avatar headline tagline location createdAt")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Jobnode.countDocuments(query),
    ]);

    const jobseekers = docs.map((d) => ({
      _id: d._id,
      fullName: d.fullName,
      avatar: d.avatar || "",
      headline: d.headline || "",
      tagline: d.tagline || "",
      location: locString(d.location),
      createdAt: d.createdAt,
    }));

    res.json({
      jobseekers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("❌ getPublicJobseekers:", err);
    res.status(500).json({ message: "Failed to fetch jobseekers" });
  }
};

// ── GET /api/jobseekers/:id — public single profile (shaped like an application) ─
// Returns the same shape the candidate detail page expects, so a profile and an
// application render through the same UI. No PII (email) is exposed.
export const getPublicJobseekerById = async (req, res) => {
  try {
    const d = await Jobnode.findById(req.params.id)
      .select(
        "fullName avatar headline tagline location linkedin github createdAt onboardingComplete",
      )
      .lean();

    if (!d || !d.onboardingComplete) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      _id: `js_${d._id}`,
      profileId: d._id,
      isProfile: true,
      roleTitle: d.headline || "Professional",
      roleType: "",
      preferredLocation: locString(d.location),
      coverLetter: "",
      portfolioLinks: [],
      applicantRole: "jobseeker",
      createdAt: d.createdAt,
      resumeAvailable: false,
      jobseeker: {
        _id: d._id,
        fullName: d.fullName || "Anonymous",
        avatar: d.avatar || "",
        headline: d.headline || "",
        tagline: d.tagline || "",
        linkedin: d.linkedin || "",
        github: d.github || "",
        location:
          typeof d.location === "object" && d.location
            ? d.location
            : { country: locString(d.location), city: "", area: "" },
        education: [],
        projects: [],
        certifications: [],
        workExperience: [],
        skill: [],
      },
    });
  } catch (err) {
    console.error("❌ getPublicJobseekerById:", err);
    res.status(500).json({ error: "Failed to fetch candidate" });
  }
};
