import express from "express";
import {
  submitContact,
  getContactMessages,
  updateContactMessageStatus,
} from "../controllers/contactController.js";

const router = express.Router();

// Public — anyone can submit
router.post("/", submitContact);

export default router;
