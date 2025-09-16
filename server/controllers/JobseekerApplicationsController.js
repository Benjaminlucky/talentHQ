import JobseekerApplication from "../models/JobseekerApplication.js";

// Jobseeker creates new Application for definite roles

export const createApplication = async (req, res) => {
  try {
    const {
      roleTitle,
      roleType,
      preferredLocation,
      coverLetter,
      portfolioLinks,
    } = req.body;

    const newApplication = await JobseekerApplication.create({
      jobseeker: req.user.id,
      roleTitle,
      roleType,
      preferredLocation,
      coverLetter,
      portfolioLinks,
      resume: req.body.resume || "", // reuse profile resume if not provided
    });

    res.status(201).json(newApplication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Jobseeker views their own applications
export const getMyApplications = async (req, res) => {
  try {
    const apps = await JobseekerApplication.find({
      jobseeker: req.user.id,
    }).populate("jobseeker", "fullName avatar email");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Employers view applications
export const getAllApplications = async (req, res) => {
  try {
    const apps = await JobseekerApplication.find().populate(
      "jobseeker",
      "fullName avatar email location headline tagline"
    );

    // Hide resume path from public
    const safeApplications = apps.map((applications) => ({
      ...applications.toObject(),
      resume: undefined, // remove resume file path
      resumeAvailable: true, // just a flag
    }));

    res.json(safeApplications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update application status (for employers/admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const app = await JobseekerApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//resume request endPoint

export const getResume = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id).populate(
      "jobseeker"
    );

    if (!app) return res.status(404).json({ error: "Application not found" });

    // 🔒 Add auth/role check here (only employers or admins)
    // e.g. if (req.user.role !== "employer") return res.status(403).json({ error: "Forbidden" });

    if (!app.resume) {
      return res.status(400).json({ error: "No resume uploaded" });
    }

    res.json({ resume: app.resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
