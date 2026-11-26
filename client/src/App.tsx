
import { Routes, Route } from "react-router-dom";

// LAYOUT
import Layout from "./components/layout/Layout";

// AUTHENTICATION
import ProtectedRoute from "./components/auth/shared/ProtectedRoute";
import PublicRoute from "./components/auth/shared/PublicRoute";

// PAGES
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage/VerifyEmailPage";
import PendingVerificationPage from "./pages/VerifyEmailPage/PendingVerificationPage";

/**
 * Defines Walo's application routing structure.
 *
 * Routes are divided into:
 * - Public email verification.
 * - Guest-only authentication pages.
 * - Authenticated account verification.
 * - Email-verified business pages.
 *
 * Business APIs independently enforce authorization
 * on the backend.
 *
 * @returns The application's route configuration.
 */
export default function App() {
  return (
    <Routes>
      {/* PUBLIC EMAIL VERIFICATION */}

      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />

      {/* GUEST-ONLY ROUTES */}

      <Route element={<PublicRoute />}>
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Route>

      {/* AUTHENTICATED ROUTES */}

      <Route element={<ProtectedRoute />}>
        {/* Unverified users must be able to access this page. */}

        <Route
          path="/verify-email/pending"
          element={<PendingVerificationPage />}
        />

        {/* VERIFIED BUSINESS ROUTES */}

        <Route
          element={
            <ProtectedRoute requireVerifiedEmail />
          }
        >
          <Route element={<Layout />}>
            <Route
              path="/"
              element={<HomePage />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
