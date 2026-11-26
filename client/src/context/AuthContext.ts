import { createContext } from "react";

import type { AuthContextType } from "../types/auth";

/**
 * Global authentication context.
 *
 * Provides authenticated user information,
 * session state and authentication actions
 * throughout the Walo application.
 */
export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );