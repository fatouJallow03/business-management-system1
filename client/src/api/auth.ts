
import { API_URL } from "./url";
import type { RegistrationData } from "../components/auth/register/types";

/**
 * Authenticates an existing Walo user.
 *
 * Sends the user's credentials to the backend,
 * where the password is verified against its stored hash.
 *
 * @param identifier - The user's email address.
 * @param password - The user's password.
 * @returns Authentication token and user information.
 * @throws Error if authentication fails.
 */
/**
 * Authenticates a user using email and password.
 *
 * Allows the browser to receive the HTTP-only
 * authentication cookie from the backend.
 *
 * @param identifier - The user's email address.
 * @param password - The user's password.
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
 * Transforms frontend field names into the format
 * expected by the backend registration schema.
 *
 * @param data - The complete registration form data.
 * @returns Registered business, owner and subscription.
 * @throws Error if registration fails.
 */
export async function registerBusiness(
    data: RegistrationData
) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
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
                currency: data.business.currency
            },
            owner: {
                username: data.owner.username,
                email: data.owner.email,
                password: data.owner.password,
                confirmPassword: data.owner.confirmPassword
            }
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Registration failed"
        );
    }

    return result;
}

/**
 * Checks whether a business name is available.
 *
 * Supports request cancellation to prevent outdated
 * results when the user continues typing.
 *
 * @param name - The requested business name.
 * @param signal - Optional request cancellation signal.
 * @returns The availability status of the business name.
 * @throws Error if the availability check fails.
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
            data.message || "Failed to check business name"
        );
    }

    return data;
}
/**
 * Checks whether a username is available for registration.
 *
 * Sends a GET request to the authentication API.
 * Supports request cancellation to prevent outdated responses.
 *
 * @param username - The requested username.
 * @param signal - Optional signal to cancel the request.
 * @returns An object containing username availability.
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

  if (!response.ok) {
    throw new Error("Unable to check username availability.");
  }

  return response.json();
}
/**
 * Retrieves the currently authenticated user.
 *
 * Sends the HTTP-only session cookie to the backend.
 *
 * @returns Current user response or null if unauthenticated.
 * @throws Error if the request fails unexpectedly.
 */
export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to retrieve your session.");
  }

  return response.json();
}

/**
 * Logs out the currently authenticated user.
 *
 * Requests the backend to clear the authentication cookie.
 *
 * @returns Successful logout response.
 * @throws Error if logout fails.
 */
export async function logoutUser() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to log out. Please try again.");
  }

  return response.json();
}