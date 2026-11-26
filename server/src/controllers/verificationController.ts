
import type { Response } from "express";

import pool from "../db.js";

import type { AuthRequest } from "../middleware/authMiddleware.js";

import { sendVerificationEmail } from "../services/verificationEmailService.js";

type VerificationUser = {
  id: string;
  email: string;
  username: string;
  email_verified_at: Date | null;
};

type VerificationActivity = {
  requests_last_hour: number;
  latest_request: Date | null;
};

/**
 * Sends another verification email to the currently
 * authenticated Walo user.
 *
 * The recipient is retrieved from PostgreSQL rather
 * than accepting an arbitrary email address.
 *
 * Requests are limited per account to reduce abuse
 * and prevent excessive email delivery.
 *
 * @param req - Authenticated user request.
 * @param res - Express response object.
 */
export async function resendVerificationEmail(
  req: AuthRequest,
  res: Response
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (!req.user) {
    res.status(401).json({
      message: "Authentication required.",
    });
    return;
  }

  try {
    const userResult = await pool.query<VerificationUser>(
      `SELECT
         id,
         email,
         username,
         email_verified_at
       FROM users
       WHERE id = $1
         AND business_id = $2
       LIMIT 1`,
      [req.user.userId, req.user.businessId]
    );

    const user = userResult.rows[0];

    if (!user || !user.email) {
      res.status(404).json({
        message: "Account not found.",
      });
      return;
    }

    if (user.email_verified_at) {
      res.status(200).json({
        message: "Your email is already verified.",
      });
      return;
    }

    const activityResult =
      await pool.query<VerificationActivity>(
        `SELECT
           COUNT(*) FILTER (
             WHERE created_at > NOW() - INTERVAL '1 hour'
           )::int AS requests_last_hour,
           MAX(created_at) AS latest_request
         FROM email_verification_tokens
         WHERE user_id = $1`,
        [user.id]
      );

    const activity = activityResult.rows[0];

    if (activity) {
      if (activity.requests_last_hour >= 3) {
        res.status(429).json({
          message:
            "Too many verification requests. Try again later.",
        });
        return;
      }

      if (
        activity.latest_request &&
        Date.now() -
          new Date(activity.latest_request).getTime() <
          2 * 60 * 1000
      ) {
        res.status(429).json({
          message:
            "Please wait two minutes before requesting another email.",
        });
        return;
      }
    }

    await sendVerificationEmail(
      user.id,
      user.email,
      user.username
    );

    res.status(200).json({
      message:
        "A new verification email has been requested.",
    });
  } catch (error) {
    console.error(
      "Resend verification failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    res.status(500).json({
      message:
        "Unable to send verification email. Please try again.",
    });
  }
}
