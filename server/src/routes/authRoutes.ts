
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
  loginLimiter,
  registerLimiter,
  availabilityLimiter,
} from "../middleware/rateLimit.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * Limits public email verification attempts.
 *
 * Allows a maximum of 10 requests per IP address
 * within a 15-minute window.
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Too many verification attempts. Please try again later.",
  },
});

/**
 * Limits verification email resend attempts.
 *
 * Allows a maximum of 5 requests per IP address
 * within a 15-minute window.
 *
 * Additional account-based restrictions are
 * enforced by the verification controller.
 */
const verificationResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message:
      "Too many verification requests. Please try again later.",
  },
});

/**
 * Walo authentication routes.
 *
 * Handles business registration, user login,
 * session management, email verification,
 * and verification email resending.
 *
 * Public endpoints are rate-limited where appropriate.
 * Protected endpoints require a valid JWT and
 * an active PostgreSQL session.
 */

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

/**
 * Registers a business and its initial owner.
 */
router.post(
  "/register",
  registerLimiter,
  registerBusiness
);

/**
 * Authenticates an existing user.
 */
router.post(
  "/login",
  loginLimiter,
  login
);

/**
 * Checks business name availability.
 */
router.get(
  "/check-business-name",
  availabilityLimiter,
  checkBusinessName
);

/**
 * Checks username availability.
 */
router.get(
  "/check-username",
  availabilityLimiter,
  checkUsername
);

/**
 * Verifies an email address using a secure,
 * single-use verification token.
 *
 * Authentication is not required because the
 * verification token authorizes this operation.
 */
router.post(
  "/verify-email",
  emailVerificationLimiter,
  verifyEmail
);

/**
 * Ends the current browser session.
 *
 * Revokes the database session when a valid
 * signed JWT identifies it.
 *
 * Expired or invalid authentication cookies
 * can still be cleared.
 *
 * This endpoint must remain protected by the
 * application's global CSRF middleware.
 */
router.post(
  "/logout",
  logout
);

// ==========================================
// PROTECTED AUTHENTICATION ROUTES
// ==========================================

/**
 * Retrieves the currently authenticated user.
 *
 * Requires a valid JWT and active
 * PostgreSQL authentication session.
 */
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

/**
 * Sends another verification email to the
 * currently authenticated user.
 *
 * Uses the user's stored email address.
 *
 * Protected by authentication, IP-based
 * rate limiting, and account-based restrictions.
 */
router.post(
  "/resend-verification",
  authMiddleware,
  verificationResendLimiter,
  resendVerificationEmail
);

export default router;
