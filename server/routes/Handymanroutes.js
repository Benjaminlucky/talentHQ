// routes/handymanRoutes.js
import express from "express";
import {
  getHandymen,
  getHandymanProfile,
} from "../controllers/handymancontroller.js";

const router = express.Router();

// Public — no auth required
router.get("/", getHandymen);
router.get("/:id", getHandymanProfile);

export default router;
