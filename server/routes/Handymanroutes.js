// routes/handymanRoutes.js
import express from "express";
import {
  getHandymen,
  getHandymanProfile,
  getHandymanPortfolio,
  getMyHandymanProfile,
  updateMyHandymanProfile,
  getMyPortfolio,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "../controllers/Handymancontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getHandymen);

// ── Authenticated — /me routes MUST come before /:id ─────────────────────────
router.get("/me", verifyToken, getMyHandymanProfile);
router.patch("/me", verifyToken, updateMyHandymanProfile);
router.get("/me/portfolio", verifyToken, getMyPortfolio);
router.post("/me/portfolio", verifyToken, addPortfolioItem);
router.put("/me/portfolio/:itemId", verifyToken, updatePortfolioItem);
router.delete("/me/portfolio/:itemId", verifyToken, deletePortfolioItem);

// ── Public profile (/:id must be last to avoid swallowing /me) ───────────────
router.get("/:id/portfolio", getHandymanPortfolio);
router.get("/:id", getHandymanProfile);

export default router;
