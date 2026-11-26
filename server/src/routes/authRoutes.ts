
import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  registerBusiness,
  login,
  logout,
  checkBusinessName,
  checkUsername,
  getCurrentUser,
  verifyEmail,
} from "../controllers/authController.js";

import {
  resendVerificationEmail,
} from "../controllers/verificationController.js";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordResetController.js";

import {
  loginLimiter,
  registerLimiter,
  availabilityLimiter,
} from "../middleware/rateLimit.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

/**
 * Limits public email verification attempts.
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many verification attempts.",
  },
});

/**
 * Limits verification email resend attempts.
 */
const verificationResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many verification requests.",
  },
});

/**
 * Limits password reset email requests per IP.
 *
 * Account-level restrictions must also be
 * implemented before production deployment.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Too many password reset requests. Try again later.",
  },
});

/**
 * Limits password reset submission attempts.
 */
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Too many password reset attempts. Try again later.",
  },
});

/**
 * Configures Walo authentication routes.
 *
 * Separates public authentication flows from
 * operations requiring an active user session.
 *
 * Protected routes validate HTTP-only cookies
 * and active PostgreSQL sessions.
 */
const router = Router();

// PUBLIC AUTHENTICATION

router.post(
  "/register",
  registerLimiter,
  registerBusiness
);

router.post(
  "/login",
  loginLimiter,
  login
);

router.get(
  "/check-business-name",
  availabilityLimiter,
  checkBusinessName
);

router.get(
  "/check-username",
  availabilityLimiter,
  checkUsername
);

router.post(
  "/verify-email",
  emailVerificationLimiter,
  verifyEmail
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPassword
);

router.post(
  "/logout",
  logout
);

// AUTHENTICATED ROUTES

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

router.post(
  "/resend-verification",
  authMiddleware,
  verificationResendLimiter,
  resendVerificationEmail
);

export default router;
