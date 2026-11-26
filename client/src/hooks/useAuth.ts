import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

/**
 * Provides access to Walo's authentication context.
 *
 * Allows components to access the authenticated
 * user and authentication actions.
 *
 * @returns The current authentication context.
 * @throws Error if used outside AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider."
    );
  }

  return context;
}