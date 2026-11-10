
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type TokenPayload = {
    userId: string;
    businessId: string;
    role: "owner" | "manager" | "employee";
};

export type AuthRequest = Request & {
    user?: TokenPayload;
};

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided"
        });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({
            message: "Server authentication configuration error"
        });
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string" ||
            typeof decoded.businessId !== "string" ||
            !["owner", "manager", "employee"].includes(decoded.role)
        ) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.user = {
            userId: decoded.userId,
            businessId: decoded.businessId,
            role: decoded.role as TokenPayload["role"]
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
