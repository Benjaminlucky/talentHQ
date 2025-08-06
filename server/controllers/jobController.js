import EmployerModel from "../models/Employer.model.js";
import JobModel from "../models/job.model.js";

// ✅ Create Job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      state,
      lga,
      address,
      phoneNumber,
      category,
      type,
      salary,
      experienceLevel,
      deadline,
      companyId,
      postedBy,
      jobFor,
    } = req.body;

    let employer = null;
    if (companyId) {
      employer = await EmployerModel.findById(companyId);
      if (!employer) {
        return res.status(404).json({ message: "Employer not found" });
      }
    }

    const job = new JobModel({
      title,
      description,
      location,
      state,
      lga,
      address,
      phoneNumber,
      category,
      type,
      salary,
      experienceLevel,
      deadline,
      company: employer?._id || null,
      postedBy: postedBy || "employer",
      jobFor,
    });

    await job.save();

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Paginated Jobs with full company details
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

// ✅ Get Job by ID with company details
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobModel.findById(id)
      .populate("company", "companyName logo") // <-- this links to Employer
      .lean(); // makes it a plain object for easy use

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Failed to fetch job" });
  }
};
