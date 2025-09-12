import Education from "../models/Education.js";

export const addEducation = async (req, res) => {
  try {
    const edu = await Education.create({ ...req.body, user: req.user.id });
    res.status(201).json(edu);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add education", error: err.message });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const edu = await Education.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!edu) return res.status(404).json({ message: "Education not found" });
    res.json(edu);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update education", error: err.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const deleted = await Education.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted)
      return res.status(404).json({ message: "Education not found" });
    res.json({ message: "Education deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete education", error: err.message });
  }
};

export const getEducations = async (req, res) => {
  try {
    const edu = await Education.find({ user: req.user.id });
    res.json(edu);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch education", error: err.message });
  }
};
