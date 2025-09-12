import Skill from "../models/Skill.js";

export const addSkill = async (req, res) => {
  try {
    const skill = await Skill.create({ ...req.body, user: req.user.id });
    res.status(201).json(skill);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add skill", error: err.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update skill", error: err.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const deleted = await Skill.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Skill not found" });
    res.json({ message: "Skill deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete skill", error: err.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id });
    res.json(skills);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch skills", error: err.message });
  }
};
