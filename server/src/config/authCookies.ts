import type { CookieOptions } from "express";

/**
 * Name of Walo's authentication cookie.
 */
export const AUTH_COOKIE_NAME = "walo_session";

/**
 * Authentication session duration in milliseconds.
 *
 * Matches the JWT expiration time of one hour.
 */
export const SESSION_DURATION = 60 * 60 * 1000;

/**
 * Shared security configuration for authentication cookies.
 *
 * HTTP-only prevents JavaScript from reading the token.
 * Secure restricts cookies to HTTPS in production.
 * SameSite helps reduce cross-site request forgery.
 */
export const authCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
};