
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RegisterBusiness, RegisterOwner } from "../types/auth.js";

// REGISTER BUSINESS AND OWNER
export async function registerBusiness(
    businessData: RegisterBusiness,
    ownerData: RegisterOwner
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Hash owner's password
        const passwordHash = await bcrypt.hash(
            ownerData.password,
            12
        );

        // 2. Create business
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
                businessData.currency
            ]
        );

        const business = businessResult.rows[0];

        // 3. Create owner
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
                passwordHash
            ]
        );

        const owner = ownerResult.rows[0];

        // 4. Create 30-day trial
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
            throw new Error("Monthly subscription plan not found");
        }

        // 5. Save changes
        await client.query("COMMIT");

        return {
            business,
            owner,
            subscription
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

// LOGIN
export async function login(identifier: string, password: string) {

    // 1. Find user by email
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [identifier]
    );

    const user = result.rows[0];

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 3. Get JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is missing");
    }

    // 4. Generate JWT
    const token = jwt.sign(
        {
            userId: user.id,
            businessId: user.business_id,
            role: user.role
        },
        secret,
        { expiresIn: "1h" }
    );

    // 5. Return token and safe user information
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
