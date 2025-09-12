import Certification from "../models/Certification.js";

export const addCertification = async (req, res) => {
  try {
    const cert = await Certification.create({ ...req.body, user: req.user.id });
    res.status(201).json(cert);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add certification", error: err.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const cert = await Certification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!cert)
      return res.status(404).json({ message: "Certification not found" });
    res.json(cert);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update certification", error: err.message });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const deleted = await Certification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted)
      return res.status(404).json({ message: "Certification not found" });
    res.json({ message: "Certification deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete certification", error: err.message });
  }
};

export const getCertifications = async (req, res) => {
  try {
    const certs = await Certification.find({ user: req.user.id });
    res.json(certs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch certifications", error: err.message });
  }
};
