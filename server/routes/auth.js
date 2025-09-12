import express from "express";
import {
  getMe,
  login,
  logout,
  signup2,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup2", signup2);
router.post("/login", login);

router.get("/me", verifyToken, getMe);
router.post("/logout", logout); // ✅ new logout route

export default router;
