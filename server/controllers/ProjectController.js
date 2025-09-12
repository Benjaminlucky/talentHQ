import Project from "../models/Project.js";

export const addProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, user: req.user.id });
    res.status(201).json(project);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add project", error: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update project", error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete project", error: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    res.json(projects);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch projects", error: err.message });
  }
};
