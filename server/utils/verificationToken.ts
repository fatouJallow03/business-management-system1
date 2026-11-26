
import { createHash, randomBytes } from "node:crypto";

/**
 * Verification links expire after 30 minutes.
 */
export const EMAIL_VERIFICATION_EXPIRY_MINUTES = 30;

/**
 * Generates a cryptographically secure verification token.
 *
 * The raw token is sent to the user by email.
 * Only its SHA-256 hash is stored in PostgreSQL.
 *
 * @returns A secure random verification token.
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hashes an email verification token using SHA-256.
 *
 * @param token - Raw verification token.
 * @returns SHA-256 hash represented as hexadecimal.
 */
export function hashVerificationToken(
  token: string
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Calculates the expiration date for a verification token.
 *
 * @returns Date when the verification link expires.
 */
export function getVerificationTokenExpiry(): Date {
  return new Date(
    Date.now() +
      EMAIL_VERIFICATION_EXPIRY_MINUTES * 60 * 1000
  );
}
