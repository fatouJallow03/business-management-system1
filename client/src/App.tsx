
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
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";

/**
 * Defines Walo's application routes.
 *
 * Public password recovery remains accessible
 * even if a browser has an existing session.
 *
 * Business routes require authentication and
 * email verification.
 *
 * @returns Walo route configuration.
 */
export default function App() {
  return (
    <Routes>
      {/* PUBLIC ACCOUNT RECOVERY */}

      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* GUEST-ONLY ROUTES */}

      <Route element={<PublicRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* AUTHENTICATED ROUTES */}

      <Route element={<ProtectedRoute />}>
        <Route
          path="/verify-email/pending"
          element={<PendingVerificationPage />}
        />

        {/* VERIFIED BUSINESS ROUTES */}

        <Route element={<ProtectedRoute requireVerifiedEmail />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
