import { rateLimit } from "express-rate-limit";

/**
 * Converts minutes into milliseconds.
 *
 * @param minutes - Duration in minutes.
 * @returns Duration in milliseconds.
 */
const minutesToMs = (minutes: number): number =>
    minutes * 60 * 1000;

/**
 * Protects against repeated login attempts
 * and brute-force attacks.
 */
export const loginLimiter = rateLimit({
    windowMs: minutesToMs(15),
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        message:
            "Too many login attempts. Please try again in 15 minutes."
    }
});

/**
 * Protects against automated registrations
 * and account creation abuse.
 */
export const registerLimiter = rateLimit({
    windowMs: minutesToMs(60),
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Too many registration attempts. Please try again later."
    }
});

/**
 * Protects public username and business name
 * availability endpoints against automated abuse.
 */
export const availabilityLimiter = rateLimit({
    windowMs: minutesToMs(1),
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Too many availability checks. Please try again shortly."
    }
});