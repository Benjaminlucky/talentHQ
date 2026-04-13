// routes/flagRoutes.js
import express from "express";
import {
  createFlag,
  getFlags,
  resolveFlag,
  getPendingCount,
} from "../controllers/flagController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createFlag);
router.get("/", getFlags);
router.get("/count", getPendingCount);
router.patch("/:id/resolve", resolveFlag);

export default router;
