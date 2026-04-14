// routes/paymentRoutes.js
import express from "express";
import {
  initializeSubscription,
  initializeAdPayment,
  initializeJobBoost,
  paystackWebhook,
  verifyPayment,
  getPlans,
  getMySubscription,
  getActiveAds,
  trackAdClick,
} from "../controllers/paystackController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/plans", getPlans);
router.get("/ads/active", getActiveAds);
router.post("/ads/:id/click", trackAdClick);

// ── Paystack webhook — MUST be raw body, no auth ──────────────────────────────
// Mount BEFORE express.json() parses the body (handled in index.js with rawBody)
router.post("/webhook", paystackWebhook);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.use(verifyToken);

router.get("/subscription", getMySubscription);
router.post("/subscription/initialize", initializeSubscription);
router.post("/ad/initialize", initializeAdPayment);
router.post("/boost/initialize", initializeJobBoost);
router.get("/verify/:reference", verifyPayment);

export default router;
