// controllers/jobController.js
import Employer from "../models/Employer.js";
import JobModel from "../models/job.model.js";
import Plan from "../models/Plan.js";

// ── Create Job ────────────────────────────────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      qualification,
      responsibilities,
      skills,
      benefits,
      salary,
      experienceLevel,
      deadline,
      company,
      location,
      state,
      lga,
      address,
      phoneNumber,
      category,
      type,
      jobFor,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !location?.trim())
      return res
        .status(400)
        .json({ message: "Title, description and location are required" });

    let companyId = company;

    if (req.user.role === "employer") {
      const employer = await Employer.findById(req.user.id);
      if (!employer)
        return res.status(404).json({ message: "Employer not found" });
      companyId = employer._id;

      // ── Plan limit enforcement ─────────────────────────────────────────────
      const planName = employer.activePlan || "employer_free";
      const planExpiresAt = employer.planExpiresAt;
      // Treat expired paid plans as free
      const effectivePlan =
        planExpiresAt && new Date(planExpiresAt) < new Date()
          ? "employer_free"
          : planName;

      const planDoc = await Plan.findOne({
        name: effectivePlan,
        active: true,
      }).lean();
      const jobPostLimit = planDoc?.features?.jobPostLimit ?? 2;

      if (jobPostLimit !== -1) {
        const activeJobCount = await JobModel.countDocuments({
          company: employer._id,
          status: { $in: ["open", "paused"] },
        });

        if (activeJobCount >= jobPostLimit) {
          return res.status(403).json({
            message: `Your ${planDoc?.displayName || "current"} plan allows up to ${jobPostLimit} active job${jobPostLimit === 1 ? "" : "s"}. Close an existing job or upgrade your plan to post more.`,
            code: "PLAN_LIMIT_REACHED",
            limit: jobPostLimit,
            current: activeJobCount,
          });
        }
      }
    }

    if (req.user.role === "superadmin" && !companyId)
      return res
        .status(400)
        .json({ message: "Superadmin must provide a company id" });

    const newJob = await JobModel.create({
      title: title.trim(),
      description: description.trim(),
      qualification: qualification?.trim() || "",
      responsibilities: responsibilities?.trim() || "",
      skills: skills?.trim() || "",
      benefits: benefits?.trim() || "",
      salary: salary?.trim() || "",
      experienceLevel: experienceLevel?.trim() || "",
      deadline: deadline || null,
      company: companyId,
      location: location.trim(),
      state: state?.trim() || "",
      lga: lga?.trim() || "",
      address: address?.trim() || "",
      phoneNumber: phoneNumber?.trim() || "",
      category: category?.trim() || "",
      type: type || "Full-time",
      jobFor: jobFor || "professional",
      status: "open",
      postedBy: req.user.role,
    });

    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    console.error("❌ createJob:", error);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

// ── Get employer's own posted jobs ────────────────────────────────────────────
export const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { company: req.user.id };
    if (status && status !== "all") query.status = status;

    const [jobs, total] = await Promise.all([
      JobModel.find(query)
        .populate("company", "companyName logo")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      JobModel.countDocuments(query),
    ]);

    res.json({
      jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("❌ getMyJobs:", error);
    res.status(500).json({ message: "Failed to fetch your jobs" });
  }
};

// ── Update job status ─────────────────────────────────────────────────────────
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["open", "filled", "closed", "paused"];
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ message: `Status must be one of: ${allowed.join(", ")}` });

    const job = await JobModel.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (
      req.user.role !== "superadmin" &&
      job.company?.toString() !== req.user.id.toString()
    )
      return res
        .status(403)
        .json({ message: "Not authorised to update this job" });

    job.status = status;
    await job.save();
    res.json({ message: `Job marked as ${status}`, job });
  } catch (error) {
    console.error("❌ updateJobStatus:", error);
    res.status(500).json({ message: "Failed to update job status" });
  }
};

// ── Delete employer's own job ─────────────────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await JobModel.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (
      req.user.role !== "superadmin" &&
      job.company?.toString() !== req.user.id.toString()
    )
      return res
        .status(403)
        .json({ message: "Not authorised to delete this job" });

    await job.deleteOne();
    res.json({ message: "Job deleted" });
  } catch (error) {
    console.error("❌ deleteJob:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
};

// ── Get all jobs (public, with filters) ───────────────────────────────────────
export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      location = "",
      category = "",
      jobType = "",
      jobFor = "",
      company = "",
    } = req.query;

    const query = { $or: [{ status: "open" }, { status: { $exists: false } }] };
    if (search) query.title = { $regex: search, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };
    if (jobType) query.type = jobType;
    if (jobFor) query.jobFor = jobFor;
    if (company) query.company = company;

    const [jobs, count] = await Promise.all([
      JobModel.find(query)
        .populate(
          "company",
          "companyName logo email phoneNumber industry location avgRating reviewCount",
        )
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean(),
      JobModel.countDocuments(query),
    ]);

    res.json({
      jobs,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
      totalJobs: count,
    });
  } catch (error) {
    console.error("❌ getJobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// ── Get single job ────────────────────────────────────────────────────────────
export const getJobById = async (req, res) => {
  try {
    const job = await JobModel.findById(req.params.id)
      .populate(
        "company",
        "companyName logo companyWebsite industry location phone avgRating reviewCount",
      )
      .lean();
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    console.error("❌ getJobById:", error);
    res.status(500).json({ message: "Failed to fetch job" });
  }
};

// ── Get employer public profile ───────────────────────────────────────────────
export const getEmployerPublicProfile = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.employerId)
      .select(
        "-password -oauthId -oauthProvider -emailVerified -banned -onboardingComplete -__v",
      )
      .lean();
    if (!employer)
      return res.status(404).json({ message: "Employer not found" });

    const jobs = await JobModel.find({
      company: req.params.employerId,
      $or: [{ status: "open" }, { status: { $exists: false } }],
    })
      .select(
        "title type location salary experienceLevel category jobFor deadline createdAt status",
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ employer, jobs });
  } catch (error) {
    console.error("❌ getEmployerPublicProfile:", error);
    res.status(500).json({ message: "Failed to fetch employer profile" });
  }
};
