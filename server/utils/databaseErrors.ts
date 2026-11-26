
/**
 * Represents a PostgreSQL database error.
 */
type DatabaseError = Error & {
    code?: string;
    constraint?: string;
};

/**
 * Checks whether an error is a PostgreSQL
 * unique constraint violation.
 *
 * PostgreSQL error code 23505 indicates that
 * a duplicate value violates a unique constraint.
 *
 * @param error - The caught error.
 * @returns True if the error is a unique violation.
 */
export function isUniqueViolation(
    error: unknown
): error is DatabaseError {
    return (
        error instanceof Error &&
        "code" in error &&
        error.code === "23505"
    );
}

/**
 * Returns a safe registration error message
 * based on the violated database constraint.
 *
 * Avoids exposing sensitive database information
 * or revealing whether an email or phone exists.
 *
 * @param constraint - The violated database constraint.
 * @returns A user-friendly registration error message.
 */
export function getRegistrationConflictMessage(
    constraint?: string
): string {
    switch (constraint) {
        case "unique_business_name":
            return "This business name is already taken.";

        case "unique_username":
        case "users_username_key":
            return "This username is already taken.";

        default:
            return "Registration could not be completed with these details.";
    }
}
