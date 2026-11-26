
import type {
    Request,
    Response,
    NextFunction
} from "express";

/**
 * HTTP methods that must not modify server-side data.
 */
const safeMethods = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);

/**
 * Trusted frontend origins permitted to perform
 * state-changing requests against the Walo API.
 */
const allowedOrigins = new Set([
    process.env.CLIENT_URL || "http://localhost:5173"
]);

/**
 * Protects the application against Cross-Site
 * Request Forgery (CSRF).
 *
 * Validates the request origin for operations
 * that may modify server-side data.
 *
 * Rejects requests from untrusted or missing origins.
 *
 * @param req - Incoming Express request.
 * @param res - Express response object.
 * @param next - Continues the middleware chain.
 */
export function csrfMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Allow read-only requests.
    if (safeMethods.has(req.method)) {
        next();
        return;
    }

    const origin = req.get("Origin");

    // Reject requests from untrusted origins.
    if (!origin || !allowedOrigins.has(origin)) {
        res.status(403).json({
            message: "Request origin is not allowed."
        });

        return;
    }

    next();
}
