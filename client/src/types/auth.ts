
/**
 * Supported user roles within Walo.
 */
export type UserRole =
  | "owner"
  | "manager"
  | "employee";

/**
 * Represents an authenticated Walo user.
 *
 * Includes their business membership, role,
 * and current email verification status.
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  businessId: string;
  businessName: string;
  emailVerified: boolean;
}

/**
 * Represents the current authentication response.
 */
export interface AuthResponse {
  user: AuthUser;
}

/**
 * Defines the global authentication context.
 *
 * Authentication state is managed using
 * HTTP-only session cookies.
 */
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (
    identifier: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshSession: () => Promise<void>;
}
