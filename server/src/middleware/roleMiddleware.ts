import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";

type Role = "owner" | "manager" | "employee";

export function roleMiddleware(...allowedRoles: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const role = req.user?.role;

        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({
                error: "Access denied"
            });
        }

        next();
    };
}