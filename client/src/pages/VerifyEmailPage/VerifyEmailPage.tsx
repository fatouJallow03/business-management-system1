
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  CheckCircle2,
  AlertCircle,
  MailCheck,
  LoaderCircle,
} from "lucide-react";

import AuthLayout from "../../components/auth/shared/AuthLayout";

import { verifyEmail } from "../../api/auth";

import sharedStyles from "../../components/auth/shared/AuthForm.module.scss";
import styles from "./VerifyEmailPage.module.scss";

type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

/**
 * Displays the email verification experience.
 *
 * Uses the existing Walo authentication layout,
 * shared styles and centralized API functions.
 *
 * Verification is user-initiated to prevent
 * email security scanners from automatically
 * consuming a single-use token.
 *
 * @returns Email verification page.
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] =
    useState<VerificationStatus>("idle");

  const [message, setMessage] = useState("");

  /**
   * Verifies the email address with the backend.
   *
   * The token is removed from the browser URL
   * after successful verification.
   */
  async function handleVerify(): Promise<void> {
    if (
      !token ||
      !/^[a-f0-9]{64}$/.test(token) ||
      status === "loading" ||
      status === "success"
    ) {
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await verifyEmail(token);

      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname
      );

      setMessage(result.message);
      setStatus("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify your email."
      );

      setStatus("error");
    }
  }

  const invalidToken =
    !token || !/^[a-f0-9]{64}$/.test(token);

  return (
    <AuthLayout variant="login">
      <div className={styles.content}>
        {status === "success" ? (
          <>
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
              <p role="status">{message}</p>
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
            <div
              className={`${styles.icon} ${styles.errorIcon}`}
            >
              <AlertCircle
                size={32}
                aria-hidden="true"
              />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Invalid verification link</h1>
              <p>
                Your verification link is missing or
                incorrectly formatted. Please open
                the original link from your email.
              </p>
            </header>

            <Link
              to="/login"
              className={sharedStyles.secondaryButton}
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <div className={styles.icon}>
              <MailCheck
                size={32}
                aria-hidden="true"
              />
            </div>

            <header className={sharedStyles.heading}>
              <h1>Verify your email</h1>

              <p>
                Confirm your email address to help
                secure your Walo business account.
              </p>
            </header>

            {status === "error" && (
              <p
                className={sharedStyles.errorMessage}
                role="alert"
              >
                {message}
              </p>
            )}

            <button
              type="button"
              className={sharedStyles.primaryButton}
              onClick={handleVerify}
              disabled={status === "loading"}
              aria-busy={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <LoaderCircle
                    size={18}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                  Verifying...
                </>
              ) : (
                "Verify email address"
              )}
            </button>

            <p className={styles.helperText}>
              Your verification link expires after
              30 minutes.
            </p>

            <p className={sharedStyles.footerText}>
              <Link to="/login">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
