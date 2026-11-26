
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

// COMPONENTS
import Input from "../../ui/input/Input";
import AuthLayout from "../shared/AuthLayout";

// HOOKS
import { useAuth } from "../../../hooks/useAuth";

// STYLES
import sharedStyles from "../shared/AuthForm.module.scss";
import styles from "./Login.module.scss";

/**
 * Displays Walo's login page.
 *
 * Authenticates users through the global authentication
 * context using HTTP-only session cookies.
 *
 * Reuses shared UI components and authentication styles
 * to maintain a consistent user experience.
 *
 * @returns The login page.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles login form submission.
   *
   * Authenticates the user through AuthContext
   * and redirects them after successful login.
   *
   * @param event - Login form submission event.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login(identifier.trim(), password);

      navigate("/", { replace: true });

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <div className={styles.loginContent}>
        {/* PAGE HEADING */}

        <header className={sharedStyles.heading}>
          <span className={styles.eyebrow}>
            YOUR BUSINESS. YOUR SPACE.
          </span>

          <h1>Welcome back</h1>

          <p>Sign in to manage your business with Walo.</p>
        </header>

        {/* LOGIN FORM */}

        <form
          className={sharedStyles.form}
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          {/* EMAIL ADDRESS */}

          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setError("");
            }}
            disabled={loading}
            required
          />

          {/* PASSWORD */}

          <div className={sharedStyles.passwordField}>
            <Input
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />

            {/* PASSWORD VISIBILITY */}

            <button
              type="button"
              className={sharedStyles.passwordToggle}
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* AUTHENTICATION ERROR */}

          {error && (
            <p
              className={sharedStyles.errorMessage}
              role="alert"
            >
              {error}
            </p>
          )}

          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            className={sharedStyles.primaryButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className={styles.spinner}
                  aria-hidden="true"
                />

                Signing in...
              </>
            ) : (
              <>
                Sign in

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        {/* REGISTRATION LINK */}

        <p className={sharedStyles.footerText}>
          New to Walo?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
