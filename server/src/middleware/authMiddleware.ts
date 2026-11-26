
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";
import pool from "../db.js";

import { AUTH_COOKIE_NAME } from "../config/authCookies.js";

/**
 * Supported roles within Walo.
 */
export type UserRole = "owner" | "manager" | "employee";

/**
 * Represents the authenticated user's JWT payload.
 */
export type TokenPayload = {
  userId: string;
  businessId: string;
  role: UserRole;
  sessionId: string;
};

/**
 * Extends the Express request with authenticated
 * user information.
 */
export type AuthRequest = Request & {
  user?: TokenPayload;
};

/**
 * Validates the contents of a decoded JWT.
 *
 * @param decoded - The decoded JWT payload.
 * @returns True if the payload has the required structure.
 */
function isValidTokenPayload(
  decoded: unknown
): decoded is TokenPayload {
  if (!decoded || typeof decoded !== "object") {
    return false;
  }

  const payload = decoded as Partial<TokenPayload>;

  return (
    typeof payload.userId === "string" &&
    typeof payload.businessId === "string" &&
    typeof payload.sessionId === "string" &&
    payload.userId.length > 0 &&
    payload.businessId.length > 0 &&
    payload.sessionId.length > 0 &&
    (
      payload.role === "owner" ||
      payload.role === "manager" ||
      payload.role === "employee"
    )
  );
}

/**
 * Authenticates incoming requests using an HTTP-only
 * JWT cookie and a PostgreSQL session record.
 *
 * Rejects missing, invalid, expired or revoked sessions.
 *
 * Also verifies that the user still belongs to the
 * business and has the role recorded in the JWT.
 *
 * @param req - Incoming Express request.
 * @param res - Express response object.
 * @param next - Continues the middleware chain.
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== "string" || !token) {
    res.status(401).json({
      message: "Authentication required.",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Authentication service unavailable.",
    });
    return;
  }

  let decoded: TokenPayload;

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (!isValidTokenPayload(payload)) {
      res.status(401).json({
        message: "Invalid authentication session.",
      });
      return;
    }

    decoded = payload;
  } catch {
    res.status(401).json({
      message: "Invalid or expired session. Please sign in.",
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT 1
       FROM user_sessions AS sessions
       INNER JOIN users
         ON users.id = sessions.user_id
       WHERE sessions.id = $1
         AND sessions.user_id = $2
         AND users.business_id = $3
         AND users.role = $4
         AND sessions.revoked_at IS NULL
         AND sessions.expires_at > NOW()
       LIMIT 1`,
      [
        decoded.sessionId,
        decoded.userId,
        decoded.businessId,
        decoded.role,
      ]
    );

    if (result.rowCount !== 1) {
      res.status(401).json({
        message: "Session is no longer active. Please sign in.",
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error(
      "Session verification failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    res.status(500).json({
      message: "Unable to verify your session.",
    });
  }
}
