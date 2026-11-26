
import { z } from "zod";

/**
 * Supported operating currencies in Walo.
 *
 * A business can select its preferred currency
 * independently of its registered country.
 */
export const supportedCurrencies = [
    "GMD",
    "XOF",
    "GHS",
    "EUR",
    "GBP",
    "USD"
] as const;

/**
 * Countries currently supported by Walo.
 *
 * This list can be extended as Walo expands
 * into new markets.
 */
export const supportedCountries = [
    "Gambia",
    "Senegal",
    "Ghana"
] as const;

/**
 * Validates a business name.
 *
 * This schema can be reused during registration
 * and business name availability checks.
 */
export const businessNameSchema = z.string()
    .trim()
    .min(2, "Business name must contain at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters")
    .regex(
        /[\p{L}\p{N}]/u,
        "Business name must contain a letter or number"
    );

/**
 * Validates a username.
 *
 * Allows letters, numbers, underscores,
 * hyphens and periods.
 */
export const usernameSchema = z.string()
    .trim()
    .min(3, "Username must contain at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
        /^[\p{L}\p{N}_.-]+$/u,
        "Username contains invalid characters"
    );

/**
 * Validates an email address.
 *
 * Removes surrounding spaces and converts
 * the email address to lowercase.
 */
const emailSchema = z.string()
    .trim()
    .toLowerCase()
    .max(255)
    .pipe(z.email("Please enter a valid email address"));

/**
 * Validates an international phone number.
 *
 * Removes common formatting characters before
 * validating the international number format.
 *
 * Example: +220 123 4567 becomes +2201234567.
 */
const phoneSchema = z.string()
    .trim()
    .transform((phone) => phone.replace(/[\s()-]/g, ""))
    .pipe(
        z.string().regex(
            /^\+[1-9]\d{6,14}$/,
            "Please enter a valid international phone number"
        )
    );

/**
 * Validates passwords for new accounts.
 *
 * Requires at least 15 Unicode characters.
 *
 * The maximum of 72 bytes prevents silent password
 * truncation while Walo uses bcrypt for hashing.
 *
 * Passwords are not trimmed or converted to lowercase.
 */
export const passwordSchema = z.string()
    .refine(
        (password) => Array.from(password).length >= 15,
        {
            message: "Password must contain at least 15 characters"
        }
    )
    .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        {
            message: "Password cannot exceed 72 bytes"
        }
    );

/**
 * Validates business registration information.
 *
 * Ensures that business details meet Walo's
 * requirements before being stored in PostgreSQL.
 */
const businessSchema = z.object({
    name: businessNameSchema,

    email: emailSchema,

    phone_number: phoneSchema,

    address: z.string()
        .trim()
        .min(1, "Business address is required")
        .max(255, "Address cannot exceed 255 characters"),

    city: z.string()
        .trim()
        .min(2, "Please enter a valid city")
        .max(100, "City cannot exceed 100 characters"),

    country: z.enum(supportedCountries),

    business_type: z.enum([
        "restaurant",
        "market"
    ]),

    currency: z.enum(supportedCurrencies)
});

/**
 * Validates business owner account information.
 *
 * Ensures that the username, email and password
 * meet the registration requirements.
 *
 * Password confirmation must match the original
 * password before registration can continue.
 */
const ownerSchema = z.object({
    username: usernameSchema,

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string()
        .min(1, "Please confirm your password")

}).refine(
    (owner) => owner.password === owner.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);

/**
 * Validates the complete registration request.
 *
 * Contains both business information and
 * the initial business owner's account details.
 */
export const registerSchema = z.object({
    business: businessSchema,
    owner: ownerSchema
});

/**
 * Validates incoming login requests.
 *
 * Existing users are not required to meet the new
 * 15-character password requirement when logging in.
 *
 * Their passwords are verified against the stored hash.
 */
export const loginSchema = z.object({
    identifier: emailSchema,

    password: z.string()
        .min(1, "Password is required")
        .max(1024, "Invalid password")
});
