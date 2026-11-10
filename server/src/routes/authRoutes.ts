import { Router } from "express";
import {
  registerBusiness,
  login
} from "../controllers/authController.js";

const router = Router();

// Register a new business and its owner
router.post("/register", registerBusiness);

// Login with email or phone number + password
router.post("/login", login);

export default router;