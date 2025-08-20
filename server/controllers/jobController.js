import EmployerModel from "../models/Employer.model.js";
import JobModel from "../models/job.model.js";

// ✅ Create Job
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

    let companyId = company;

    // If employer, force attach their own company
    if (req.user.role === "employer") {
      const employer = await EmployerModel.findById(req.user.id);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }
      companyId = employer._id;
    }

    // If superadmin posting but no company provided
    if (req.user.role === "superadmin" && !companyId) {
      return res
        .status(400)
        .json({ message: "Superadmin must provide company id" });
    }

    const newJob = new JobModel({
      title,
      description,
      qualification,
      responsibilities,
      skills,
      benefits,
      salary,
      experienceLevel,
      deadline,
      company: companyId,
      location,
      state,
      lga,
      address,
      phoneNumber,
      category,
      type,
      jobFor,
      postedBy: req.user.role,
    });

    await newJob.save();

    res.status(201).json({ message: "Job created successfully", job: newJob });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

// ✅ Get Paginated Jobs
export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", location = "" } = req.query;

    const query = {
      title: { $regex: search, $options: "i" },
      location: { $regex: location, $options: "i" },
    };

    const jobs = await JobModel.find(query)
      .populate("company", "companyName logo email phoneNumber industry")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await JobModel.countDocuments(query);

    res.status(200).json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalJobs: count,
    });
  } catch (error) {
    console.error("Fetch Jobs Error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// ✅ Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobModel.findById(id)
      .populate("company", "companyName logo")
      .lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Failed to fetch job" });
  }
};
