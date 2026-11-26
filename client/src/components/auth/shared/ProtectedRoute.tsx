
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

/**
 * Protects routes that require authentication.
 *
 * Waits for session restoration before determining
 * whether the user can access a protected page.
 *
 * Redirects unauthenticated users to the login page.
 *
 * @returns Protected page content or login redirect.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
