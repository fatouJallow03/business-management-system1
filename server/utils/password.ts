
import argon2 from "argon2";
import bcrypt from "bcrypt";

/**
 * Argon2id password hashing configuration.
 *
 * Uses 19 MiB of memory, two processing
 * passes and one degree of parallelism.
 */
const passwordOptions = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
} as const;
/**
 * Hashes a plain-text password using Argon2id.
 *
 * Used during registration, password resets
 * and password hash upgrades.
 *
 * @param password - The plain-text password.
 * @returns A securely generated password hash.
 * @throws Error if password hashing fails.
 */
export async function hashPassword(
    password: string
): Promise<string> {
    return argon2.hash(password, passwordOptions);
}

/**
 * Verifies a password against its stored hash.
 *
 * Supports Argon2id and legacy bcrypt hashes
 * to maintain compatibility with existing users.
 *
 * @param password - The submitted password.
 * @param passwordHash - The stored password hash.
 * @returns True if the password is valid.
 */
export async function verifyPassword(
    password: string,
    passwordHash: string
): Promise<boolean> {
    if (passwordHash.startsWith("$argon2id$")) {
        return argon2.verify(passwordHash, password);
    }

    if (/^\$2[aby]\$/.test(passwordHash)) {
        return bcrypt.compare(password, passwordHash);
    }

    return false;
}

/**
 * Determines whether a stored password hash
 * should be upgraded.
 *
 * @param passwordHash - The stored password hash.
 * @returns True if the hash requires an upgrade.
 */
export function needsPasswordUpgrade(
    passwordHash: string
): boolean {
    if (!passwordHash.startsWith("$argon2id$")) {
        return true;
    }

    return argon2.needsRehash(
        passwordHash,
        passwordOptions
    );
}
