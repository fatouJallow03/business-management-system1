
import { useState } from "react";
import {
  Eye,
  EyeOff,
  UserRound,
  CheckCircle2,
  Circle,
} from "lucide-react";

import Input from "../../ui/input/Input";

import {
  isValidUsername,
  isValidEmail,
  validatePassword,
  doPasswordsMatch,
  getFieldFeedback,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_BYTES,
} from "../../../utils/validation";

import type { AvailabilityStatus } from "../../../hooks/useAvailability";

import type {
  OwnerData,
  UpdateOwner,
} from "./types";

import sharedStyles from "../shared/AuthForm.module.scss";
import styles from "./RegisterForm.module.scss";

/**
 * Properties required by the owner account step.
 */
type Props = {
  owner: OwnerData;
  updateOwner: UpdateOwner;
  usernameStatus: AvailabilityStatus;
};

/**
 * Returns username validation and availability feedback.
 *
 * Validates the username format before displaying
 * the result of the server-side availability check.
 *
 * @param username - The requested username.
 * @param status - Current availability status.
 * @returns Feedback properties for the Input component.
 */
function getUsernameFeedback(
  username: string,
  status: AvailabilityStatus
) {
  if (!username.trim()) {
    return {
      status: "idle" as const,
    };
  }

  if (!isValidUsername(username)) {
    return {
      status: "error" as const,
      message:
        "Use 3–30 letters, numbers, underscores, hyphens or periods.",
    };
  }

  switch (status) {
    case "checking":
      return {
        status: "checking" as const,
        message: "Checking username availability...",
      };

    case "available":
      return {
        status: "success" as const,
        message: "Username is available.",
      };

    case "unavailable":
      return {
        status: "error" as const,
        message: "This username is already taken.",
      };

    case "error":
      return {
        status: "idle" as const,
        message: "Unable to check username availability.",
      };

    default:
      return {
        status: "idle" as const,
      };
  }
}

/**
 * Displays the final step of business registration.
 *
 * Collects the initial business owner's credentials
 * and provides real-time validation feedback.
 *
 * Responsibilities:
 * - Username format validation.
 * - Username availability feedback.
 * - Email format validation.
 * - Password validation.
 * - Password visibility controls.
 * - Password confirmation.
 *
 * Form data is controlled by the parent
 * RegisterForm component.
 *
 * @param props - Owner data, update function and availability status.
 * @returns The owner account registration step.
 */
export default function OwnerAccountStep({
  owner,
  updateOwner,
  usernameStatus,
}: Props) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // EMAIL VALIDATION

  const validEmail = isValidEmail(owner.email);

  // PASSWORD VALIDATION

  const {
    hasMinimumLength,
    hasValidByteLength,
    isValid: validPassword,
  } = validatePassword(owner.password);

  // PASSWORD CONFIRMATION

  const passwordsMatch = doPasswordsMatch(
    owner.password,
    owner.confirmPassword
  );

  return (
    <div className={styles.stepContent}>
      {/* STEP HEADING */}

      <div className={styles.stepHeading}>
        <h1>Create your owner account</h1>

        <p>You'll use these details to sign in to Walo.</p>
      </div>

      {/* ACCOUNT DETAILS */}

      <div className={styles.sectionHeading}>
        <UserRound size={19} aria-hidden="true" />

        <h2>Account details</h2>
      </div>

      <div className={styles.fields}>
        {/* USERNAME */}

        <Input
          label="Username"
          name="username"
          placeholder="Choose a username"
          value={owner.username}
          onChange={(event) =>
            updateOwner("username", event.target.value)
          }
          {...getUsernameFeedback(
            owner.username,
            usernameStatus
          )}
          autoComplete="username"
          required
        />

        {/* EMAIL ADDRESS */}

        <Input
          label="Your email address"
          type="email"
          name="ownerEmail"
          placeholder="you@example.com"
          value={owner.email}
          onChange={(event) =>
            updateOwner("email", event.target.value)
          }
          {...getFieldFeedback(
            owner.email,
            validEmail,
            "Enter a valid email address."
          )}
          autoComplete="email"
          required
        />

        {/* PASSWORD */}

        <div className={styles.passwordGroup}>
          <div className={sharedStyles.passwordField}>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a secure password"
              value={owner.password}
              onChange={(event) =>
                updateOwner(
                  "password",
                  event.target.value
                )
              }
              status={
                !owner.password
                  ? "idle"
                  : validPassword
                    ? "success"
                    : "error"
              }
              autoComplete="new-password"
              aria-describedby="password-requirements"
              required
            />

            {/* PASSWORD VISIBILITY TOGGLE */}

            <button
              type="button"
              className={sharedStyles.passwordToggle}
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={19} aria-hidden="true" />
              ) : (
                <Eye size={19} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* LIVE PASSWORD REQUIREMENTS */}

          <div
            id="password-requirements"
            className={styles.passwordRequirements}
            aria-live="polite"
          >
            <div
              className={`${styles.requirement} ${
                hasMinimumLength
                  ? styles.requirementMet
                  : ""
              }`}
            >
              {hasMinimumLength ? (
                <CheckCircle2
                  size={15}
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  size={15}
                  aria-hidden="true"
                />
              )}

              <span>
                At least {MIN_PASSWORD_LENGTH} characters
              </span>
            </div>

            <p className={styles.passwordHint}>
              Tip: Use a long, unique passphrase.
            </p>

            {!hasValidByteLength && (
              <p className={styles.passwordError}>
                Password exceeds the {MAX_PASSWORD_BYTES}
                -byte limit.
              </p>
            )}
          </div>
        </div>

        {/* CONFIRM PASSWORD */}

        <div className={sharedStyles.passwordField}>
          <Input
            label="Confirm password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            name="confirmPassword"
            placeholder="Repeat your password"
            value={owner.confirmPassword}
            onChange={(event) =>
              updateOwner(
                "confirmPassword",
                event.target.value
              )
            }
            status={
              !owner.confirmPassword
                ? "idle"
                : passwordsMatch
                  ? "success"
                  : "error"
            }
            autoComplete="new-password"
            aria-describedby="password-match-feedback"
            required
          />

          {/* CONFIRM PASSWORD VISIBILITY TOGGLE */}

          <button
            type="button"
            className={sharedStyles.passwordToggle}
            onClick={() =>
              setShowConfirmPassword(
                (previous) => !previous
              )
            }
            aria-label={
              showConfirmPassword
                ? "Hide confirmation password"
                : "Show confirmation password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* PASSWORD MATCH FEEDBACK */}

        <div
          id="password-match-feedback"
          aria-live="polite"
          className={`${styles.requirement} ${
            passwordsMatch
              ? styles.requirementMet
              : owner.confirmPassword
                ? styles.passwordError
                : ""
          }`}
        >
          {passwordsMatch ? (
            <CheckCircle2
              size={15}
              aria-hidden="true"
            />
          ) : (
            <Circle
              size={15}
              aria-hidden="true"
            />
          )}

          <span>
            {!owner.confirmPassword
              ? "Repeat your password"
              : passwordsMatch
                ? "Passwords match"
                : "Passwords do not match"}
          </span>
        </div>
      </div>
    </div>
  );
}
