
import type {
  Response,
  NextFunction,
} from "express";

import pool from "../db.js";

import type { AuthRequest } from "./authMiddleware.js";

/**
 * Requires the authenticated user to have
 * a verified email address.
 *
 * Must run after authMiddleware, which validates
 * the JWT and active PostgreSQL session.
 *
 * Reads verification status directly from PostgreSQL
 * rather than trusting client-provided information.
 *
 * @param req - Authenticated request.
 * @param res - Express response.
 * @param next - Continues to the protected endpoint.
 */
export async function requireVerifiedEmail(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required.",
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT 1
       FROM users
       WHERE id = $1
         AND business_id = $2
         AND email_verified_at IS NOT NULL
       LIMIT 1`,
      [
        req.user.userId,
        req.user.businessId,
      ]
    );

    if (result.rowCount !== 1) {
      res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message:
          "Please verify your email address to continue.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error(
      "Email verification authorization failed:",
      error instanceof Error
        ? error.name
        : "Unknown error"
    );

    res.status(500).json({
      message:
        "Unable to verify account access.",
    });
  }
}
