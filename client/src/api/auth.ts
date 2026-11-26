
import { API_URL } from "./url";
import type { RegistrationData } from "../components/auth/register/types";

/**
 * Response returned by email verification endpoints.
 */
export interface EmailVerificationResponse {
  message: string;
}

/**
 * Authenticates a Walo user using email and password.
 *
 * The backend validates the credentials and creates
 * an HTTP-only authentication cookie.
 *
 * The JWT is never exposed to client-side JavaScript.
 *
 * @param identifier - User's email address.
 * @param password - User's password.
 * @returns Authenticated user information.
 * @throws Error if authentication fails.
 */
export async function loginUser(
  identifier: string,
  password: string
) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Login failed. Please try again."
    );
  }

  return result;
}

/**
 * Registers a new business and its initial owner.
 *
 * Transforms frontend registration fields into
 * the structure expected by the backend Zod schema.
 *
 * @param data - Validated registration form data.
 * @returns Created business, owner, and subscription.
 * @throws Error if registration fails.
 */
export async function registerBusiness(
  data: RegistrationData
) {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business: {
          name: data.business.name,
          email: data.business.email,
          phone_number: data.business.phone,
          address: data.business.address,
          city: data.business.city,
          country: data.business.country,
          business_type: data.business.type,
          currency: data.business.currency,
        },
        owner: {
          username: data.owner.username,
          email: data.owner.email,
          password: data.owner.password,
          confirmPassword: data.owner.confirmPassword,
        },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Registration failed."
    );
  }

  return result;
}

/**
 * Checks business name availability.
 *
 * Supports request cancellation to avoid processing
 * outdated results while a user is typing.
 *
 * @param name - Business name to check.
 * @param signal - Optional AbortSignal.
 * @returns Business name availability.
 * @throws Error if the request fails.
 */
export async function checkBusinessName(
  name: string,
  signal?: AbortSignal
): Promise<{ available: boolean }> {
  const response = await fetch(
    `${API_URL}/auth/check-business-name?name=${encodeURIComponent(name)}`,
    { signal }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to check business name."
    );
  }

  return data;
}

/**
 * Checks username availability.
 *
 * Supports request cancellation to prevent
 * outdated availability results.
 *
 * @param username - Username to check.
 * @param signal - Optional AbortSignal.
 * @returns Username availability.
 * @throws Error if the request fails.
 */
export async function checkUsername(
  username: string,
  signal?: AbortSignal
): Promise<{ available: boolean }> {
  const response = await fetch(
    `${API_URL}/auth/check-username?username=${encodeURIComponent(username)}`,
    { signal }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to check username availability."
    );
  }

  return data;
}

/**
 * Retrieves the currently authenticated user.
 *
 * Uses the HTTP-only session cookie to restore
 * the user's authentication state.
 *
 * Returns null if the session is missing or expired.
 *
 * @returns Current user response or null.
 * @throws Error for unexpected server errors.
 */
export async function getCurrentUser() {
  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      "Unable to retrieve your session."
    );
  }

  return response.json();
}

/**
 * Logs out the currently authenticated user.
 *
 * Requests the backend to revoke the active
 * PostgreSQL session and clear the HTTP-only cookie.
 *
 * @returns Logout confirmation.
 * @throws Error if logout fails.
 */
export async function logoutUser() {
  const response = await fetch(
    `${API_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to log out. Please try again."
    );
  }

  return response.json();
}

/**
 * Verifies a user's email address.
 *
 * Submits the single-use token from the email
 * verification link to the backend.
 *
 * The backend validates its hash, expiry,
 * and previous usage before verifying the account.
 *
 * @param token - Verification token from the email.
 * @returns Email verification confirmation.
 * @throws Error if verification fails.
 */
export async function verifyEmail(
  token: string
): Promise<EmailVerificationResponse> {
  const response = await fetch(
    `${API_URL}/auth/verify-email`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    }
  );

  const data: EmailVerificationResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to verify your email."
    );
  }

  return data;
}

/**
 * Requests another email verification link.
 *
 * Uses the current HTTP-only authentication
 * session to identify the user.
 *
 * The backend determines the recipient email
 * from PostgreSQL rather than accepting an
 * arbitrary email address from the frontend.
 *
 * @returns Verification resend confirmation.
 * @throws Error if the request fails.
 */
export async function resendVerificationEmail():
  Promise<EmailVerificationResponse> {
  const response = await fetch(
    `${API_URL}/auth/resend-verification`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data: EmailVerificationResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to resend verification email."
    );
  }

  return data;
}


/**
 * Response returned by password recovery endpoints.
 */
export interface PasswordRecoveryResponse {
  message: string;
}

/**
 * Requests a password reset email.
 *
 * The backend returns a generic response to prevent
 * account enumeration.
 *
 * @param email - Account email address.
 * @returns Generic request confirmation.
 */
export async function requestPasswordReset(
  email: string
): Promise<PasswordRecoveryResponse> {
  const response = await fetch(
    `${API_URL}/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data: PasswordRecoveryResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to request password reset."
    );
  }

  return data;
}

/**
 * Replaces a password using a single-use reset token.
 *
 * The backend validates the token and password,
 * updates the password hash, and revokes sessions.
 *
 * @param token - Password reset token.
 * @param password - New account password.
 * @param confirmPassword - Password confirmation.
 * @returns Reset confirmation.
 */
export async function resetAccountPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<PasswordRecoveryResponse> {
  const response = await fetch(
    `${API_URL}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
        confirmPassword,
      }),
    }
  );

  const data: PasswordRecoveryResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to reset your password."
    );
  }

  return data;
}
