
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

/**
 * Configuration for protected routes.
 */
interface ProtectedRouteProps {
  requireVerifiedEmail?: boolean;
}

/**
 * Protects Walo routes using the authenticated session.
 *
 * Responsibilities:
 * - Wait for session restoration.
 * - Redirect unauthenticated users to login.
 * - Optionally require email verification.
 * - Preserve the requested location for login redirects.
 *
 * The backend independently enforces verification
 * for protected business endpoints.
 *
 * @param requireVerifiedEmail - Whether verified email is required.
 * @returns Protected content or the appropriate redirect.
 */
export default function ProtectedRoute({
  requireVerifiedEmail = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireVerifiedEmail && !user.emailVerified) {
    return (
      <Navigate
        to="/verify-email/pending"
        replace
      />
    );
  }

  return <Outlet />;
}
