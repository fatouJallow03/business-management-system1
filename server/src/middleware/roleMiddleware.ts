
import type { Response, NextFunction } from "express";

import type {
    AuthRequest,
    TokenPayload
} from "./authMiddleware.js";

/**
 * Supported user roles within Walo.
 *
 * Derived from the authentication token payload
 * to maintain a single source of truth.
 */
type Role = TokenPayload["role"];

/**
 * Restricts access to routes based on user roles.
 *
 * Must be executed after the authentication middleware.
 * Ensures that only authenticated users with an
 * explicitly permitted role can access a resource.
 *
 * @param allowedRoles - Roles permitted to access the route.
 * @returns Express authorization middleware.
 */
export function roleMiddleware(...allowedRoles: Role[]) {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): void => {
        // 1. Verify that the user is authenticated.
        if (!req.user) {
            res.status(401).json({
                message: "Authentication required."
            });

            return;
        }

        // 2. Verify that the user has permission.
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: "You do not have permission to perform this action."
            });

            return;
        }

        // 3. Continue to the controller.
        next();
    };
}
