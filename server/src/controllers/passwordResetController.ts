
import type { Request, Response } from "express";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/passwordResetSchema.js";

import {
  requestPasswordReset,
  resetPassword as resetAccountPassword,
} from "../services/passwordResetService.js";

/**
 * Handles requests for a password reset email.
 *
 * Always returns a generic response so attackers
 * cannot determine whether an account exists.
 *
 * Email delivery failures are logged internally
 * without exposing account information.
 *
 * @param req - Incoming request.
 * @param res - Express response.
 */
export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  const validation =
    forgotPasswordSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: "Please enter a valid email address.",
    });
    return;
  }

  try {
    await requestPasswordReset(
      validation.data.email
    );
  } catch (error) {
    console.error(
      "Password reset request failed:",
      error instanceof Error
        ? error.name
        : "Unknown error"
    );
  }

  res.status(200).json({
    message:
      "If an account exists with this email, " +
      "you will receive password reset instructions.",
  });
}

/**
 * Resets a Walo account password.
 *
 * Validates the token and password before
 * delegating the secure database transaction
 * to the password reset service.
 *
 * Successful resets invalidate existing sessions.
 *
 * @param req - Incoming reset request.
 * @param res - Express response.
 */
export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  const validation =
    resetPasswordSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: "Invalid password reset details.",
      errors: validation.error.flatten(),
    });
    return;
  }

  try {
    const success = await resetAccountPassword(
      validation.data.token,
      validation.data.password
    );

    if (!success) {
      res.status(400).json({
        message:
          "This reset link is invalid, expired or already used.",
      });
      return;
    }

    res.status(200).json({
      message:
        "Your password has been reset successfully. Please sign in.",
    });
  } catch (error) {
    console.error(
      "Password reset failed:",
      error instanceof Error
        ? error.name
        : "Unknown error"
    );

    res.status(500).json({
      message:
        "Unable to reset your password. Please try again.",
    });
  }
}
