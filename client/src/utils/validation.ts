
/**
 * Walo's reusable frontend validation utilities.
 *
 * Provides consistent validation rules across
 * registration, account settings and team management.
 *
 * Backend validation remains the source of truth.
 */

export const MIN_PASSWORD_LENGTH = 15;
export const MAX_PASSWORD_BYTES = 72;

/**
 * Validates a business name.
 *
 * @param name - Business name to validate.
 * @returns True if the name format is valid.
 */
export function isValidBusinessName(name: string): boolean {
  const value = name.trim();

  return (
    value.length >= 2 &&
    value.length <= 100 &&
    /[\p{L}\p{N}]/u.test(value)
  );
}

/**
 * Validates the basic format of an email address.
 *
 * @param email - Email address to validate.
 * @returns True if the email format is valid.
 */
export function isValidEmail(email: string): boolean {
  const value = email.trim();

  return (
    value.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

/**
 * Removes common formatting characters from
 * an international phone number.
 *
 * @param phone - Original phone number.
 * @returns Normalized phone number.
 */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[\s()-]/g, "");
}

/**
 * Validates the format of an international phone number.
 *
 * @param phone - Phone number to validate.
 * @returns True if the phone number format is valid.
 */
export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(
    normalizePhone(phone)
  );
}

/**
 * Validates a username.
 *
 * Allows letters, numbers, underscores,
 * hyphens and periods.
 *
 * @param username - Username to validate.
 * @returns True if the username format is valid.
 */
export function isValidUsername(username: string): boolean {
  const value = username.trim();

  return (
    value.length >= 3 &&
    value.length <= 30 &&
    /^[\p{L}\p{N}_.-]+$/u.test(value)
  );
}

/**
 * Validates a business address.
 *
 * @param address - Business address.
 * @returns True if the address meets the requirements.
 */
export function isValidAddress(address: string): boolean {
  const value = address.trim();

  return value.length >= 1 && value.length <= 255;
}

/**
 * Validates a city name.
 *
 * @param city - City name to validate.
 * @returns True if the city name meets the requirements.
 */
export function isValidCity(city: string): boolean {
  const value = city.trim();

  return value.length >= 2 && value.length <= 100;
}

/**
 * Evaluates password requirements.
 *
 * Counts Unicode characters and UTF-8 bytes.
 * The byte limit protects against bcrypt truncation.
 *
 * @param password - Password to validate.
 * @returns Password validation results.
 */
export function validatePassword(password: string) {
  const length = Array.from(password).length;
  const bytes = new TextEncoder().encode(password).length;

  const hasMinimumLength = length >= MIN_PASSWORD_LENGTH;
  const hasValidByteLength = bytes <= MAX_PASSWORD_BYTES;

  return {
    length,
    bytes,
    hasMinimumLength,
    hasValidByteLength,
    isValid: hasMinimumLength && hasValidByteLength,
  };
}

/**
 * Checks whether two passwords match.
 *
 * @param password - Original password.
 * @param confirmation - Repeated password.
 * @returns True if both non-empty passwords match.
 */
export function doPasswordsMatch(
  password: string,
  confirmation: string
): boolean {
  return password.length > 0 && password === confirmation;
}

/**
 * Generates consistent visual validation feedback.
 *
 * Empty inputs remain neutral until information
 * has been entered.
 *
 * @param value - Current input value.
 * @param valid - Whether the input is valid.
 * @param errorMessage - Feedback for invalid input.
 * @returns Validation properties for the Input component.
 */
export function getFieldFeedback(
  value: string,
  valid: boolean,
  errorMessage: string
) {
  if (!value.trim()) {
    return { status: "idle" as const };
  }

  if (!valid) {
    return {
      status: "error" as const,
      message: errorMessage,
    };
  }

  return { status: "success" as const };
}
