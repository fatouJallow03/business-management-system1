
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

/**
 * Defines Walo's application routing structure.
 *
 * Separates guest-only routes from protected routes.
 * Ensures users can only access pages appropriate
 * to their current authentication state.
 *
 * @returns The application routing configuration.
 */
export default function App() {
  return (
    <Routes>
      {/* GUEST-ONLY ROUTES */}

      <Route element={<PublicRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* PROTECTED ROUTES */}

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
