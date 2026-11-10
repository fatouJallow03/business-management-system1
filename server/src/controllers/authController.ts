
import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "../validators/authSchema.js";
import * as authService from "../services/authService.js";

// REGISTER
export async function registerBusiness(
    req: Request,
    res: Response
) {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            errors: validation.error.flatten()
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
        console.error(error);

        return res.status(500).json({
            message: "Registration failed"
        });
    }
}

// LOGIN
export async function login(
    req: Request,
    res: Response
) {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            errors: validation.error.flatten()
        });
    }

    try {
        const { identifier, password} = validation.data;

        const result = await authService.login(
            identifier,
            password
        );

        return res.status(200).json(result);

    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid email or password"
        ) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
}
