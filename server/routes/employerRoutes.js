import express from "express";
import {
  loginEmployer,
  logoutEmployer,
  refreshEmployerToken,
  signupEmployer,
} from "../controllers/employerController.js";

const router = express.Router();

router.post("/signup", signupEmployer);
router.post("/login", loginEmployer);
router.post("/refresh-token", refreshEmployerToken);
router.post("/logout", logoutEmployer);

export default router;
