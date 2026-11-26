
import pool from "../db.js";
import jwt from "jsonwebtoken";
import { SESSION_DURATION } from "../config/authCookies.js";
import type {
    RegisterBusiness,
    RegisterOwner
} from "../types/auth.js";
import { hashPassword, needsPasswordUpgrade, verifyPassword } from "../../utils/password.js";
import { sendVerificationEmail } from "./verificationEmailService.js";

/**
 * Registers a new business, its initial owner
 * and a 30-day trial subscription.
 *
 * Uses Argon2id for password hashing and a database
 * transaction to ensure data consistency.
 *
 * @param businessData - Validated business information.
 * @param ownerData - Validated owner credentials.
 * @returns Created business, owner and subscription.
 * @throws Error if registration fails.
 */

/**
 * Registers a new business and its initial owner.
 *
 * Creates the business, owner account, and trial
 * subscription within a PostgreSQL transaction.
 *
 * After successful registration, attempts to send
 * an email verification link through Resend.
 *
 * Email delivery failures do not roll back an
 * already committed business registration.
 *
 * @param businessData - Validated business information.
 * @param ownerData - Validated owner information.
 * @returns Created business, owner and subscription.
 */
export async function registerBusiness(
  businessData: RegisterBusiness,
  ownerData: RegisterOwner
) {
  // Hash the password before opening a transaction.
  const passwordHash = await hashPassword(
    ownerData.password
  );

  const client = await pool.connect();

  let registration: {
    business: {
      id: string;
      name: string;
    };
    owner: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    subscription: {
      id: string;
      status: string;
      trial_ends_at: Date;
    };
  };

  try {
    await client.query("BEGIN");

    // 1. Create the business.
    const businessResult = await client.query(
      `INSERT INTO businesses (
        name,
        email,
        phone_number,
        address,
        city,
        country,
        business_type,
        currency
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name`,
      [
        businessData.name,
        businessData.email,
        businessData.phone_number,
        businessData.address,
        businessData.city,
        businessData.country,
        businessData.business_type,
        businessData.currency,
      ]
    );

    const business = businessResult.rows[0];

    if (!business) {
      throw new Error("Unable to create business.");
    }

    // 2. Create the initial business owner.
    const ownerResult = await client.query(
      `INSERT INTO users (
        business_id,
        username,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, 'owner')
      RETURNING id, username, email, role`,
      [
        business.id,
        ownerData.username,
        ownerData.email,
        passwordHash,
      ]
    );

    const owner = ownerResult.rows[0];

    if (!owner) {
      throw new Error("Unable to create business owner.");
    }

    // 3. Create the 30-day trial subscription.
    const subscriptionResult = await client.query(
      `INSERT INTO subscriptions (
        business_id,
        plan_id,
        status,
        trial_ends_at
      )
      SELECT $1, id, 'trialing',
             NOW() + INTERVAL '30 days'
      FROM subscription_plans
      WHERE name = 'Monthly'
      RETURNING id, status, trial_ends_at`,
      [business.id]
    );

    const subscription = subscriptionResult.rows[0];

    if (!subscription) {
      throw new Error(
        "Monthly subscription plan not found."
      );
    }

    registration = {
      business,
      owner,
      subscription,
    };

    // 4. Commit the registration transaction.
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // 5. Attempt email delivery AFTER committing.
  try {
    await sendVerificationEmail(
      registration.owner.id,
      registration.owner.email,
      registration.owner.username
    );
  } catch (error) {
    // Registration has already succeeded.
    // Do not turn successful registration into HTTP 500.
    console.error(
      "Initial verification email delivery failed:",
      error instanceof Error
        ? error.name
        : "Unknown error"
    );
  }

  return registration;
}


/**
 * Authenticates an existing user.
 *
 * Supports Argon2id and legacy bcrypt passwords.
 * Automatically upgrades eligible legacy hashes
 * after successful password verification.
 *
 * @param identifier - The user's email address.
 * @param password - The submitted password.
 * @returns JWT token and safe user information.
 * @throws Error if authentication fails.
 */
export async function login(
    identifier: string,
    password: string
) {
    // 1. Find the user by email.
    const result = await pool.query(
        `SELECT
            id,
            business_id,
            username,
            email,
            password_hash,
            role
         FROM users
         WHERE email = $1`,
        [identifier]
    );

    const user = result.rows[0];

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 2. Verify the submitted password.
    const isPasswordValid = await verifyPassword(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 3. Upgrade outdated password hashes.
    const isLegacyBcrypt =
        /^\$2[aby]\$/.test(user.password_hash);

    const canSafelyUpgrade =
        !isLegacyBcrypt ||
        Buffer.byteLength(password, "utf8") <= 72;

    if (
        canSafelyUpgrade &&
        needsPasswordUpgrade(user.password_hash)
    ) {
        const upgradedHash = await hashPassword(password);

        const upgradeResult = await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE id = $2
             AND password_hash = $3`,
            [
                upgradedHash,
                user.id,
                user.password_hash
            ]
        );

        if (upgradeResult.rowCount !== 1) {
            throw new Error("Invalid email or password");
        }
    }

    // 4. Retrieve the JWT secret.
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is missing");
    }

    // 5. Generate an authentication token.
  
/**
 * Creates a persistent authentication session.
 *
 * Each successful login receives its own session ID,
 * allowing individual sessions to be revoked later.
 *
 * @returns A new session identifier.
 */
const sessionResult = await pool.query<{
    id: string;
}>(
    `INSERT INTO user_sessions (
        user_id,
        expires_at
    )
    VALUES (
        $1,
        NOW() + ($2::bigint * INTERVAL '1 millisecond')
    )
    RETURNING id`,
    [user.id, SESSION_DURATION]
);

const session = sessionResult.rows[0];

if (!session) {
    throw new Error("Unable to create authentication session.");
}

/**
 * Generates a signed JWT containing the
 * authenticated identity and database session ID.
 */
const token = jwt.sign(
    {
        userId: user.id,
        businessId: user.business_id,
        role: user.role,
        sessionId: session.id
    },
    secret,
    {
        algorithm: "HS256",
        expiresIn: "1h"
    }
);


    // 6. Return safe user information.
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            businessId: user.business_id
        }
    };
}

/**
 * Checks whether a business name is available.
 *
 * Ignores capitalization and surrounding spaces.
 *
 * @param name - The requested business name.
 * @returns True if the business name is available.
 * @throws Database query error.
 */
export async function checkBusinessName(
    name: string
): Promise<boolean> {
    const result = await pool.query(
        `SELECT id FROM businesses
         WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))`,
        [name]
    );

    return result.rows.length === 0;
}

/**
 * Checks whether a username is available.
 *
 * Ignores capitalization and surrounding spaces.
 *
 * @param username - The requested username.
 * @returns True if the username is available.
 * @throws Database query error.
 */
export async function checkUsername(
    username: string
): Promise<boolean> {
    const result = await pool.query(
        `SELECT id FROM users
         WHERE LOWER(TRIM(username)) = LOWER(TRIM($1))`,
        [username]
    );

    return result.rows.length === 0;
}

/**
 * Retrieves the authenticated user's current account information.
 *
 * Restricts the database query to the authenticated
 * user's ID and business ID to maintain tenant isolation.
 *
 * Never returns sensitive information such as password hashes.
 *
 * @param userId - The authenticated user's ID.
 * @param businessId - The authenticated user's business ID.
 * @returns Current user information or null if not found.
 */
export async function getCurrentUser(
    userId: string,
    businessId: string
) {
    const result = await pool.query(
        `SELECT
            users.id,
            users.username,
            users.email,
            users.role,
            users.business_id AS "businessId",
            businesses.name AS "businessName"
         FROM users
         INNER JOIN businesses
            ON businesses.id = users.business_id
         WHERE users.id = $1
         AND users.business_id = $2`,
        [userId, businessId]
    );

    return result.rows[0] ?? null;
}
/**
 * Revokes a user's active authentication session.
 *
 * Ensures that the session belongs to the authenticated
 * user before marking it as revoked.
 *
 * @param sessionId - Unique identifier of the session.
 * @param userId - Identifier of the session owner.
 * @returns True if an active session was revoked.
 * @throws Database error if the operation fails.
 */
export async function revokeSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE user_sessions
     SET revoked_at = NOW()
     WHERE id = $1
       AND user_id = $2
       AND revoked_at IS NULL
     RETURNING id`,
    [sessionId, userId]
  );

  return result.rowCount === 1;
}