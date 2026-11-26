
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import AuthLayout from "../../components/auth/shared/AuthLayout";

import { resendVerificationEmail } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";

import sharedStyles from "../../components/auth/shared/AuthForm.module.scss";
import styles from "./VerifyEmailPage.module.scss";

/**
 * Displays the email verification status for an
 * authenticated Walo user.
 *
 * Allows users to request another verification
 * email and refresh their account status.
 *
 * Reuses existing authentication components,
 * API functions, and global authentication state.
 *
 * @returns Pending email verification page.
 */
export default function PendingVerificationPage() {
  const { user, refreshSession } = useAuth();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Requests another verification email using the
   * authenticated user's current session.
   */
  async function handleResend(): Promise<void> {
    if (sending) return;

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
   * Refreshes the current user from PostgreSQL
   * through the existing authentication context.
   */
  async function handleCheckStatus(): Promise<void> {
    if (checking) return;

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

  return (
    <AuthLayout variant="login">
      <div className={styles.content}>
        {user?.emailVerified ? (
          <>
            <div className={`${styles.icon} ${styles.success}`}>
              <CheckCircle2 size={32} aria-hidden="true" />
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
            <div className={styles.icon}>
              <Mail size={32} aria-hidden="true" />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Check your inbox</h1>

              <p>
                We need to verify your email address
                before completing your account setup.
              </p>
            </header>

            {user?.email && (
              <p className={styles.helperText}>
                Verification email:{" "}
                <strong>{user.email}</strong>
              </p>
            )}

            {message && (
              <p role="status" className={styles.helperText}>
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className={sharedStyles.errorMessage}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              className={sharedStyles.primaryButton}
              onClick={handleResend}
              disabled={sending || checking || !user?.email}
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
                  <Mail size={18} aria-hidden="true" />
                  Resend verification email
                </>
              )}
            </button>

            <button
              type="button"
              className={sharedStyles.secondaryButton}
              onClick={handleCheckStatus}
              disabled={checking || sending}
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
                  <RefreshCw size={18} aria-hidden="true" />
                  I've verified my email
                </>
              )}
            </button>

            <p className={styles.helperText}>
              Verification links expire after 30 minutes.
              If yours has expired, request a new one.
            </p>

            <p className={sharedStyles.footerText}>
              <Link to="/">
                Back to dashboard
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
