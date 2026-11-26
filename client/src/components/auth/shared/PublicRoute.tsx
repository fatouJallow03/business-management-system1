
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

/**
 * Restricts guest-only routes to unauthenticated users.
 *
 * Waits for session restoration before determining
 * whether the user can access login or registration.
 *
 * Redirects authenticated users to the dashboard.
 *
 * @returns Public page content or dashboard redirect.
 */
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        Loading your session...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
