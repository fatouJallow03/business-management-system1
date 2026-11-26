
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { verifyEmailToken } from "../services/emailVerificationService.js";
import {
  registerSchema,
  loginSchema,
  businessNameSchema,
  usernameSchema,
} from "../validators/authSchema.js";

import * as authService from "../services/authService.js";

import {
  getRegistrationConflictMessage,
  isUniqueViolation,
} from "../../utils/databaseErrors.js";

import {
  AUTH_COOKIE_NAME,
  SESSION_DURATION,
  authCookieOptions,
} from "../config/authCookies.js";

import type { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * Registers a new business and its initial owner.
 *
 * Validates registration data using Zod before
 * calling the authentication service.
 *
 * Handles PostgreSQL unique constraint violations
 * without exposing sensitive database information.
 *
 * @param req - Incoming registration request.
 * @param res - Express response object.
 * @returns Registration result or an error response.
 */
export async function registerBusiness(
  req: Request,
  res: Response
) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      errors: validation.error.flatten(),
    });
  }

  try {
    const { business, owner } = validation.data;

    const registration = await authService.registerBusiness(
      business,
      owner
    );

    return res.status(201).json(registration);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        message: getRegistrationConflictMessage(
          error.constraint
        ),
      });
    }

    console.error(
      "Business registration failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
}

/**
 * Authenticates an existing Walo user.
 *
 * Validates the submitted credentials and delegates
 * password verification to the authentication service.
 *
 * Creates an HTTP-only authentication cookie
 * after a successful login.
 *
 * @param req - Request containing login credentials.
 * @param res - Express response object.
 * @returns Authenticated user information.
 */
export async function login(
  req: Request,
  res: Response
) {
  res.setHeader("Cache-Control", "no-store");

  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      errors: validation.error.flatten(),
    });
  }

  try {
    const { identifier, password } = validation.data;

    const { token, user } = await authService.login(
      identifier,
      password
    );

    // Store the JWT in a browser-managed HTTP-only cookie.
    res.cookie(AUTH_COOKIE_NAME, token, {
      ...authCookieOptions,
      maxAge: SESSION_DURATION,
    });

    return res.status(200).json({
      message: "Login successful.",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.error(
      "Authentication failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return res.status(500).json({
      message: "Authentication failed. Please try again.",
    });
  }
}

/**
 * Checks whether a business name is available.
 *
 * Validates the requested name using the shared
 * business name Zod schema.
 *
 * The authentication service performs a
 * case-insensitive database lookup.
 *
 * @param req - Request containing the business name.
 * @param res - Express response object.
 * @returns Business name availability.
 */
export async function checkBusinessName(
  req: Request,
  res: Response
) {
  const validation = businessNameSchema.safeParse(
    req.query.name
  );

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid business name.",
    });
  }

  try {
    const available = await authService.checkBusinessName(
      validation.data
    );

    return res.status(200).json({
      available,
    });
  } catch (error) {
    console.error(
      "Business name availability error:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return res.status(500).json({
      message: "Unable to check business name availability.",
    });
  }
}

/**
 * Checks whether a username is available.
 *
 * Validates the username using the shared
 * username Zod schema.
 *
 * The authentication service performs a
 * case-insensitive database lookup.
 *
 * @param req - Request containing the username.
 * @param res - Express response object.
 * @returns Username availability.
 */
export async function checkUsername(
  req: Request,
  res: Response
) {
  const validation = usernameSchema.safeParse(
    req.query.username
  );

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid username.",
    });
  }

  try {
    const available = await authService.checkUsername(
      validation.data
    );

    return res.status(200).json({
      available,
    });
  } catch (error) {
    console.error(
      "Username availability error:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return res.status(500).json({
      message: "Unable to check username availability.",
    });
  }
}

/**
 * Retrieves the currently authenticated user.
 *
 * Reads the verified user identity from the
 * authentication middleware.
 *
 * Queries PostgreSQL to retrieve the latest
 * account and business information.
 *
 * Never returns password hashes or authentication tokens.
 *
 * @param req - Authenticated Express request.
 * @param res - Express response object.
 * @returns Current user information.
 */
export async function getCurrentUser(
  req: AuthRequest,
  res: Response
) {
  res.setHeader("Cache-Control", "no-store");

  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const user = await authService.getCurrentUser(
      req.user.userId,
      req.user.businessId
    );

    if (!user) {
      return res.status(401).json({
        message: "Account no longer available.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Unable to retrieve authenticated user:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return res.status(500).json({
      message: "Unable to retrieve account information.",
    });
  }
}

/**
 * Logs out a user and clears the browser session.
 *
 * Verifies the JWT signature before attempting
 * to revoke its associated PostgreSQL session.
 *
 * Expired but correctly signed tokens can still
 * identify sessions that need to be revoked.
 *
 * Invalid cookies are cleared without attempting
 * to revoke an unverified session.
 *
 * Database failures are reported rather than
 * incorrectly claiming successful revocation.
 *
 * @param req - Incoming logout request.
 * @param res - Express response object.
 * @returns Logout confirmation or an error response.
 */
export async function logout(
  req: Request,
  res: Response
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Authentication service unavailable.",
    });
    return;
  }

  try {
    if (typeof token === "string" && token) {
      let decoded: jwt.JwtPayload | string;

      try {
        decoded = jwt.verify(token, secret, {
          algorithms: ["HS256"],
          ignoreExpiration: true,
        });
      } catch {
        // An invalid signature cannot identify a trusted session.
        decoded = "";
      }

      if (
        typeof decoded !== "string" &&
        typeof decoded.sessionId === "string" &&
        typeof decoded.userId === "string"
      ) {
        // Revoke the session associated with the signed token.
        await authService.revokeSession(
          decoded.sessionId,
          decoded.userId
        );
      }
    }

    // Clear the browser cookie even if it is already expired.
    res.clearCookie(
      AUTH_COOKIE_NAME,
      authCookieOptions
    );

    res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error(
      "Logout failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    res.status(500).json({
      message: "Unable to complete logout. Please try again.",
    });
  }
}

/**
 * Validates the email verification request.
 *
 * Tokens are 32 random bytes represented
 * as a 64-character hexadecimal string.
 */
const verifyEmailSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
});

/**
 * Verifies a Walo user's email address.
 *
 * Accepts a single-use verification token.
 * The verification service checks the token hash,
 * expiration time and previous usage before
 * updating the user's email verification status.
 *
 * @param req - Request containing the verification token.
 * @param res - Express response object.
 * @returns Verification confirmation or error response.
 */
export async function verifyEmail(
  req: Request,
  res: Response
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  const validation = verifyEmailSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: "Invalid verification link.",
    });
    return;
  }

  try {
    const verified = await verifyEmailToken(
      validation.data.token
    );

    if (!verified) {
      res.status(400).json({
        message:
          "This verification link is invalid, expired or already used.",
      });
      return;
    }

    res.status(200).json({
      message: "Your email has been verified successfully.",
    });
  } catch (error) {
    console.error(
      "Email verification failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    res.status(500).json({
      message:
        "Unable to verify your email. Please try again.",
    });
  }
}
