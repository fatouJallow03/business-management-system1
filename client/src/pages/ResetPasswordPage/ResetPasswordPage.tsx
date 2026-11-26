
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import AuthLayout from "../../components/auth/shared/AuthLayout";
import Input from "../../components/ui/input/Input";

import { resetAccountPassword } from "../../api/auth";
import {
  validatePassword,
  doPasswordsMatch,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_BYTES,
} from "../../utils/validation";

import sharedStyles from "../../components/auth/shared/AuthForm.module.scss";
import styles from "../VerifyEmailPage/VerifyEmailPage.module.scss";

/**
 * Allows a user to choose a new password using
 * a time-limited, single-use reset token.
 *
 * @returns Walo's password reset page.
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const invalidToken = !token || !/^[a-f0-9]{64}$/.test(token);

  /**
   * Validates and submits the new password.
   *
   * @param event - Password reset form event.
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (loading || success || invalidToken || !token) return;

    setError("");

    const validation = validatePassword(password);

    if (!validation.hasMinimumLength) {
      setError(
        `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    if (!validation.hasValidByteLength) {
      setError(
        `Password cannot exceed ${MAX_PASSWORD_BYTES} bytes.`
      );
      return;
    }

    if (!doPasswordsMatch(password, confirmPassword)) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetAccountPassword(
        token,
        password,
        confirmPassword
      );

      // Remove the token from the browser address bar.
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname
      );

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="login">
      <div className={styles.content}>
        {success ? (
          <>
            <div className={`${styles.icon} ${styles.success}`}>
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Password updated!</h1>
              <p role="status">
                Your password was reset successfully.
                Please sign in with your new password.
              </p>
            </header>

            <Link
              to="/login"
              className={sharedStyles.primaryButton}
            >
              Continue to login
            </Link>
          </>
        ) : invalidToken ? (
          <>
            <div className={`${styles.icon} ${styles.errorIcon}`}>
              <AlertCircle size={32} aria-hidden="true" />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Invalid reset link</h1>
              <p>
                Your password reset link is missing or
                incorrectly formatted.
              </p>
            </header>

            <Link
              to="/forgot-password"
              className={sharedStyles.primaryButton}
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <div className={styles.icon}>
              <LockKeyhole size={32} aria-hidden="true" />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Create a new password</h1>
              <p>
                Choose a secure password for your Walo account.
              </p>
            </header>

            <form
              className={sharedStyles.form}
              onSubmit={handleSubmit}
              aria-busy={loading}
            >
              <div className={sharedStyles.passwordField}>
                <Input
                  label="New password"
                  id="new-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className={sharedStyles.passwordToggle}
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>

              <Input
                label="Confirm new password"
                id="confirm-new-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                disabled={loading}
                required
              />

              <p className={styles.helperText}>
                Use at least {MIN_PASSWORD_LENGTH} characters,
                up to {MAX_PASSWORD_BYTES} UTF-8 bytes.
              </p>

              {error && (
                <p
                  role="alert"
                  className={sharedStyles.errorMessage}
                >
                  {error}
                </p>
              )}

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
                    Updating...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          </>
        )}

        {!success && (
          <p className={sharedStyles.footerText}>
            <Link to="/login">Back to login</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
