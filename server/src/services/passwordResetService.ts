
import pool from "../db.js";

import { hashPassword } from "../../utils/password.js";

import {
  generateVerificationToken,
  hashVerificationToken,
  getVerificationTokenExpiry,
} from "../../utils/verificationToken.js";

import { sendEmail } from "./emailService.js";

/**
 * Represents the account details required
 * to send a password reset email.
 */
interface ResetAccount {
  id: string;
  email: string;
}


/**
 * Requests a password reset for an existing account.
 *
 * Security:
 * - Does not reveal whether the account exists.
 * - Limits each account to three requests per hour.
 * - Enforces a two-minute cooldown.
 * - Uses a database row lock to prevent concurrent
 *   requests from bypassing the account limits.
 * - Stores only the SHA-256 token hash.
 * - Reuses Walo's existing Resend email service.
 *
 * @param email - Account email address.
 */
export async function requestPasswordReset(
  email: string
): Promise<void> {
  const client = await pool.connect();

  let account: ResetAccount | undefined;
  let token: string | undefined;

  try {
    await client.query("BEGIN");

    // Lock the account to serialize reset requests.
    const accountResult = await client.query<ResetAccount>(
      `SELECT id, email
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1
       FOR UPDATE`,
      [email]
    );

    account = accountResult.rows[0];

    // Do not reveal whether the account exists.
    if (!account) {
      await client.query("COMMIT");
      return;
    }

    const activityResult = await client.query<{
      requests_last_hour: number;
      latest_request: Date | null;
    }>(
      `SELECT
         COUNT(*) FILTER (
           WHERE created_at > NOW() - INTERVAL '1 hour'
         )::int AS requests_last_hour,
         MAX(created_at) AS latest_request
       FROM password_reset_tokens
       WHERE user_id = $1`,
      [account.id]
    );

    const activity = activityResult.rows[0];

    // Prevent excessive emails to one account.
    if (
      activity &&
      (
        activity.requests_last_hour >= 3 ||
        (
          activity.latest_request &&
          Date.now() -
            new Date(activity.latest_request).getTime() <
            2 * 60 * 1000
        )
      )
    ) {
      await client.query("COMMIT");
      return;
    }

    token = generateVerificationToken();

    const tokenHash = hashVerificationToken(token);
    const expiresAt = getVerificationTokenExpiry();

    await client.query(
      `INSERT INTO password_reset_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)`,
      [account.id, tokenHash, expiresAt]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (!account || !token) {
    return;
  }

  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL is not configured.");
  }

  const resetUrl = new URL("/reset-password", clientUrl);
  resetUrl.searchParams.set("token", token);

  const safeUrl = resetUrl
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <body style="
        margin: 0;
        padding: 32px 16px;
        background-color: #F7F0E5;
        font-family: Arial, sans-serif;
        color: #342A25;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          padding: 36px 28px;
          background-color: #FFFFFF;
          border-radius: 12px;
        ">
          <h1 style="color: #A64B32;">Walo</h1>
          <h2>Reset your password</h2>

          <p>
            We received a request to reset the
            password for your Walo account.
          </p>

          <p style="margin: 32px 0;">
            <a href="${safeUrl}" style="
              display: inline-block;
              padding: 14px 24px;
              background-color: #A64B32;
              color: #FFFFFF;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            ">
              Reset password
            </a>
          </p>

          <p>This link expires after 30 minutes.</p>

          <p>
            If you did not request this password reset,
            you can ignore this email.
          </p>

          <p style="
            margin-top: 32px;
            color: #8B7A6B;
            font-size: 13px;
          ">
            Walo — Business management made simple.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail(
    account.email,
    "Reset your Walo password",
    html
  );
}


/**
 * Resets an account password using a single-use token.
 *
 * Security:
 * - Validates token format.
 * - Rejects expired or previously used tokens.
 * - Hashes the new password using Argon2id.
 * - Performs database changes atomically.
 * - Invalidates outstanding password reset tokens.
 * - Revokes existing authentication sessions.
 *
 * The caller must validate password requirements
 * using Walo's existing passwordSchema.
 *
 * @param token - Raw password reset token.
 * @param newPassword - Validated replacement password.
 * @returns True if the password was reset.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return false;
  }

  const tokenHash = hashVerificationToken(token);

  // Hash before opening the transaction to
  // minimize the time database locks are held.
  const passwordHash = await hashPassword(newPassword);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Consume the token only if it is valid.
    const tokenResult = await client.query<{
      user_id: string;
    }>(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       RETURNING user_id`,
      [tokenHash]
    );

    const resetRequest = tokenResult.rows[0];

    if (!resetRequest) {
      await client.query("ROLLBACK");
      return false;
    }

    // Replace the password using the existing
    // Argon2id password hashing configuration.
    const updateResult = await client.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [passwordHash, resetRequest.user_id]
    );

    if (updateResult.rowCount !== 1) {
      throw new Error(
        "Unable to update account password."
      );
    }

    // Invalidate any other outstanding reset links.
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = $1
         AND used_at IS NULL`,
      [resetRequest.user_id]
    );

    // Force existing sessions to reauthenticate.
    await client.query(
      `UPDATE user_sessions
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND revoked_at IS NULL`,
      [resetRequest.user_id]
    );

    await client.query("COMMIT");

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
