
import { generateVerificationToken,
  hashVerificationToken,
  getVerificationTokenExpiry, } from "../../utils/verificationToken.js";
import pool from "../db.js";


/**
 * Creates and stores an email verification token.
 *
 * Only the SHA-256 hash is stored in PostgreSQL.
 * The raw token must only be shared through the
 * verification email.
 *
 * @param userId - User requesting email verification.
 * @returns Raw verification token for email delivery.
 */
export async function createEmailVerificationToken(
  userId: string
): Promise<string> {
  const token = generateVerificationToken();
  const tokenHash = hashVerificationToken(token);
  const expiresAt = getVerificationTokenExpiry();

  await pool.query(
    `INSERT INTO email_verification_tokens
       (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return token;
}

/**
 * Verifies an email address using a single-use token.
 *
 * The token must exist, remain unused and not
 * have expired.
 *
 * Verification and token consumption occur within
 * one database transaction.
 *
 * @param token - Raw verification token.
 * @returns True if email verification succeeded.
 */
export async function verifyEmailToken(
  token: string
): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return false;
  }

  const tokenHash = hashVerificationToken(token);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<{ user_id: string }>(
      `UPDATE email_verification_tokens
       SET used_at = NOW()
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       RETURNING user_id`,
      [tokenHash]
    );

    const verification = result.rows[0];

    if (!verification) {
      await client.query("ROLLBACK");
      return false;
    }

    await client.query(
      `UPDATE users
       SET email_verified_at =
         COALESCE(email_verified_at, NOW())
       WHERE id = $1`,
      [verification.user_id]
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
