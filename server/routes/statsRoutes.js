// routes/statsRoutes.js
import express from "express";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();

// Public — no auth required
router.get("/", getStats);

export default router;
