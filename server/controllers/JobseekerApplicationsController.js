import JobseekerApplication from "../models/JobseekerApplication.js";

// Jobseeker creates new Application
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
      resume: req.body.resume || "",
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

    const safeApplications = apps.map((applications) => ({
      ...applications.toObject(),
      resume: undefined,
      resumeAvailable: true,
    }));

    res.json(safeApplications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update application status
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

// Delete application (jobseeker only)
export const deleteApplication = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });

    if (app.jobseeker.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await app.deleteOne();
    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Resume endpoint
export const getResume = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id).populate(
      "jobseeker"
    );
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (!app.resume)
      return res.status(400).json({ error: "No resume uploaded" });

    res.json({ resume: app.resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
