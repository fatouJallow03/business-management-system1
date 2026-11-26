
import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import { AuthContext } from "./AuthContext";

import {
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../api/auth";

import type { AuthUser } from "../types/auth";

/**
 * Properties required by the authentication provider.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides global authentication state throughout Walo.
 *
 * Responsibilities:
 * - Restore existing authentication sessions.
 * - Manage authenticated user information.
 * - Authenticate users.
 * - Log users out.
 * - Manage session loading and error states.
 *
 * Authentication tokens are managed by the backend
 * through HTTP-only cookies.
 *
 * @param props - Components wrapped by the provider.
 * @returns The global authentication provider.
 */
export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * Restores the existing authentication session.
   *
   * Requests the current user from the backend
   * using the HTTP-only authentication cookie.
   */
  const refreshSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCurrentUser();

      setUser(response?.user ?? null);

    } catch (error) {
      setUser(null);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to restore your session."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restores the user's session when the application
   * initially loads or the browser is refreshed.
   */
  useEffect(() => {
    let active = true;

    async function initializeSession() {
      try {
        const response = await getCurrentUser();

        if (active) {
          setUser(response?.user ?? null);
        }
      } catch (error) {
        if (active) {
          setUser(null);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to restore your session."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initializeSession();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Authenticates an existing user.
   *
   * Retrieves the complete user profile after
   * the backend creates the authentication cookie.
   *
   * @param identifier - The user's email address.
   * @param password - The user's password.
   * @throws Error if authentication fails.
   */
  const login = async (
    identifier: string,
    password: string
  ): Promise<void> => {
    setError(null);

    try {
      await loginUser(identifier, password);

      const response = await getCurrentUser();

      if (!response?.user) {
        throw new Error(
          "Unable to establish an authentication session."
        );
      }

      setUser(response.user);

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";

      setError(message);

   throw new Error(message, { cause: error });
    }
  };

  /**
   * Logs out the currently authenticated user.
   *
   * Clears the authentication cookie through
   * the backend and resets local user information.
   *
   * @throws Error if logout fails.
   */
  const logout = async (): Promise<void> => {
    setError(null);

    try {
      await logoutUser();

      setUser(null);

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to log out.";

      setError(message);

     throw new Error(message, { cause: error });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
