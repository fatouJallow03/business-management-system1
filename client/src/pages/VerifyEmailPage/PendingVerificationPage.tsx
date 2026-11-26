
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  RefreshCw,
  CheckCircle2,
  LoaderCircle,
  LogOut,
} from "lucide-react";

// COMPONENTS
import AuthLayout from "../../components/auth/shared/AuthLayout";

// API
import { resendVerificationEmail } from "../../api/auth";

// HOOKS
import { useAuth } from "../../hooks/useAuth";

// STYLES
import sharedStyles from "../../components/auth/shared/AuthForm.module.scss";
import styles from "./VerifyEmailPage.module.scss";

/**
 * Displays the email verification status for an
 * authenticated Walo user.
 *
 * Responsibilities:
 * - Display the current user's email address.
 * - Request another verification email.
 * - Refresh the email verification status.
 * - Allow users to sign out and switch accounts.
 * - Provide access to the dashboard after verification.
 *
 * Reuses existing authentication components,
 * API functions, and global authentication state.
 *
 * @returns The pending email verification page.
 */
export default function PendingVerificationPage() {
  const navigate = useNavigate();

  const { user, refreshSession, logout } = useAuth();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Requests another verification email using the
   * authenticated user's current session.
   */
  async function handleResend(): Promise<void> {
    if (sending || checking || signingOut) return;

    setSending(true);
    setError("");
    setMessage("");

    try {
      const result = await resendVerificationEmail();

      setMessage(result.message);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend verification email."
      );
    } finally {
      setSending(false);
    }
  }

  /**
   * Refreshes the current user's verification status
   * through the existing authentication context.
   */
  async function handleCheckStatus(): Promise<void> {
    if (checking || sending || signingOut) return;

    setChecking(true);
    setError("");
    setMessage("");

    try {
      await refreshSession();

      setMessage(
        "Your verification status has been refreshed."
      );
    } catch {
      setError(
        "Unable to refresh your verification status."
      );
    } finally {
      setChecking(false);
    }
  }

  /**
   * Ends the current authenticated session.
   *
   * The backend revokes the PostgreSQL session
   * and clears the HTTP-only authentication cookie.
   *
   * Users are redirected to login after the
   * logout request succeeds.
   */
  async function handleLogout(): Promise<void> {
    if (signingOut || sending || checking) return;

    setSigningOut(true);
    setError("");
    setMessage("");

    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch {
      setError(
        "Unable to sign out. Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  }

  const busy = sending || checking || signingOut;

  return (
    <AuthLayout variant="login">
      <div className={styles.content}>
        {user?.emailVerified ? (
          <>
            {/* VERIFIED ACCOUNT */}

            <div
              className={`${styles.icon} ${styles.success}`}
            >
              <CheckCircle2
                size={32}
                aria-hidden="true"
              />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Email verified!</h1>

              <p>
                Your email address has been verified
                successfully. You can continue to Walo.
              </p>
            </header>

            <Link
              to="/"
              className={sharedStyles.primaryButton}
            >
              Continue to dashboard
            </Link>
          </>
        ) : (
          <>
            {/* PENDING EMAIL VERIFICATION */}

            <div className={styles.icon}>
              <Mail
                size={32}
                aria-hidden="true"
              />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Check your inbox</h1>

              <p>
                We need to verify your email address
                before completing your account setup.
              </p>
            </header>

            {/* ACCOUNT EMAIL */}

            {user?.email && (
              <p className={styles.helperText}>
                Verification email:{" "}
                <strong>{user.email}</strong>
              </p>
            )}

            {/* RESEND VERIFICATION EMAIL */}

            <button
              type="button"
              className={sharedStyles.primaryButton}
              onClick={handleResend}
              disabled={busy || !user?.email}
            >
              {sending ? (
                <>
                  <LoaderCircle
                    size={18}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Mail
                    size={18}
                    aria-hidden="true"
                  />
                  Resend verification email
                </>
              )}
            </button>

            {/* REFRESH VERIFICATION STATUS */}

            <button
              type="button"
              className={sharedStyles.secondaryButton}
              onClick={handleCheckStatus}
              disabled={busy}
            >
              {checking ? (
                <>
                  <LoaderCircle
                    size={18}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw
                    size={18}
                    aria-hidden="true"
                  />
                  I've verified my email
                </>
              )}
            </button>

            <p className={styles.helperText}>
              Verification links expire after 30 minutes.
              If yours has expired, request a new one.
            </p>
          </>
        )}

        {/* STATUS MESSAGE */}

        {message && (
          <p
            role="status"
            className={styles.helperText}
          >
            {message}
          </p>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <p
            role="alert"
            className={sharedStyles.errorMessage}
          >
            {error}
          </p>
        )}

        {/* SIGN OUT */}

        <button
          type="button"
          className={sharedStyles.secondaryButton}
          onClick={handleLogout}
          disabled={busy}
        >
          {signingOut ? (
            <>
              <LoaderCircle
                size={18}
                className={styles.spinner}
                aria-hidden="true"
              />
              Signing out...
            </>
          ) : (
            <>
              <LogOut
                size={18}
                aria-hidden="true"
              />
              Sign out
            </>
          )}
        </button>
      </div>
    </AuthLayout>
  );
}
