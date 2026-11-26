
import { z } from "zod";

import { passwordSchema } from "./authSchema.js";

/**
 * Validates password reset requests.
 *
 * Normalizes email addresses consistently
 * with Walo's existing authentication system.
 */
export const forgotPasswordSchema = z.object({
  email: z.email()
    .trim()
    .toLowerCase()
    .max(255),
});

/**
 * Validates a password reset token.
 *
 * Tokens contain 32 random bytes represented
 * as 64 hexadecimal characters.
 */
const resetTokenSchema = z.string()
  .regex(
    /^[a-f0-9]{64}$/,
    "Invalid password reset link."
  );

/**
 * Validates a new password and its confirmation.
 *
 * Reuses Walo's existing password requirements.
 */
export const resetPasswordSchema = z.object({
  token: resetTokenSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);
