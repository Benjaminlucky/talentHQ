// routes/handymanRoutes.js
import express from "express";
import {
  getHandymanProfile,
  getHandymen,
} from "../controllers/Handymancontroller.js";

const router = express.Router();

// Public — no auth required
router.get("/", getHandymen);
router.get("/:id", getHandymanProfile);

export default router;
