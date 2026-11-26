
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, LoaderCircle, CheckCircle2 } from "lucide-react";

import AuthLayout from "../../components/auth/shared/AuthLayout";
import Input from "../../components/ui/input/Input";

import { requestPasswordReset } from "../../api/auth";
import { isValidEmail } from "../../utils/validation";

import sharedStyles from "../../components/auth/shared/AuthForm.module.scss";
import styles from "../VerifyEmailPage/VerifyEmailPage.module.scss";

/**
 * Allows users to request a secure password reset link.
 *
 * Uses a generic success message so the UI does not
 * reveal whether an email address has an account.
 *
 * @returns Walo's forgot-password page.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  /**
   * Requests password reset instructions.
   *
   * @param event - Form submission event.
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="login">
      <div className={styles.content}>
        {submitted ? (
          <>
            <div className={`${styles.icon} ${styles.success}`}>
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Check your inbox</h1>
              <p role="status">
                If an account exists with this email,
                password reset instructions will be sent.
              </p>
            </header>

            <p className={styles.helperText}>
              Check your spam folder if you don't see the email.
              Reset links expire after 30 minutes.
            </p>
          </>
        ) : (
          <>
            <div className={styles.icon}>
              <Mail size={32} aria-hidden="true" />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Forgot your password?</h1>
              <p>
                Enter your email address and we'll send
                instructions to reset your password.
              </p>
            </header>

            <form
              className={sharedStyles.form}
              onSubmit={handleSubmit}
              aria-busy={loading}
            >
              <Input
                label="Email address"
                id="recovery-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                disabled={loading}
                required
              />

              {error && (
                <p role="alert" className={sharedStyles.errorMessage}>
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
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        )}

        <p className={sharedStyles.footerText}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
