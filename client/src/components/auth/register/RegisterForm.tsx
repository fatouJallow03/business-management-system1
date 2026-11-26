import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

// COMPONENTS
import AuthLayout from "../shared/AuthLayout";
import BusinessSetupStep from "./BusinessSetupStep";
import BusinessDetailsStep from "./BusinessDetailsStep";
import OwnerAccountStep from "./OwnerAccountStep";

// API
import { registerBusiness } from "../../../api/auth";

// HOOKS
import { useBusinessNameAvailability } from "../../../hooks/useBusinessNameAvailability";
import { useUsernameAvailability } from "../../../hooks/useUsernameAvailability";

// VALIDATION
import {
  isValidBusinessName,
  isValidEmail,
  isValidPhone,
  isValidAddress,
  isValidCity,
  isValidUsername,
  validatePassword,
  doPasswordsMatch,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_BYTES,
} from "../../../utils/validation";

// TYPES
import type {
  RegistrationData,
  BusinessData,
  OwnerData,
} from "./types";

// STYLES
import sharedStyles from "../shared/AuthForm.module.scss";
import styles from "./RegisterForm.module.scss";
/**
 * Initial registration data.
 *
 * Stores business information and the initial
 * owner's account credentials.
 */
const initialData: RegistrationData = {
  business: {
    name: "",
    type: "restaurant",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    currency: "",
  },
  owner: {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

/**
 * Labels displayed in the registration progress indicator.
 */
const steps = [
  "Your business",
  "Business details",
  "Owner account",
];

/**
 * Manages Walo's multi-step registration process.
 *
 * Responsibilities:
 * - Manage registration state.
 * - Navigate between registration steps.
 * - Validate business and owner information.
 * - Check business name availability.
 * - Submit registration data to the backend.
 * - Redirect successful registrations to login.
 *
 * @returns The complete registration form.
 */
export default function RegisterForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [data, setData] =
    useState<RegistrationData>(initialData);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Checks business name availability whenever
   * the entered business name changes.
   */
  const nameStatus = useBusinessNameAvailability(
    data.business.name
  );
  const usernameStatus = useUsernameAvailability(
  data.owner.username
);

  /**
   * Updates an individual business field.
   *
   * The generic type ensures that the field and
   * its value have matching TypeScript types.
   *
   * @param field - Business field to update.
   * @param value - New field value.
   */
  const updateBusiness = <K extends keyof BusinessData>(
    field: K,
    value: BusinessData[K]
  ) => {
    setData((previous) => ({
      ...previous,
      business: {
        ...previous.business,
        [field]: value,
      },
    }));

    setError("");
  };

  /**
   * Updates an individual owner account field.
   *
   * @param field - Owner field to update.
   * @param value - New field value.
   */
  const updateOwner = <K extends keyof OwnerData>(
    field: K,
    value: OwnerData[K]
  ) => {
    setData((previous) => ({
      ...previous,
      owner: {
        ...previous.owner,
        [field]: value,
      },
    }));

    setError("");
  };

  /**
   * Validates the first registration step.
   *
   * Checks business type, name format and
   * business name availability.
   *
   * @returns True if the business setup is valid.
   */
  const validateBusinessSetup = (): boolean => {
    const { business } = data;

    if (!business.type) {
      setError("Please select your business type.");
      return false;
    }

    if (!isValidBusinessName(business.name)) {
      setError("Please enter a valid business name.");
      return false;
    }

    if (nameStatus !== "available") {
      setError(
        nameStatus === "unavailable"
          ? "This business name is already taken."
          : "Unable to verify business name availability."
      );

      return false;
    }

    return true;
  };

  /**
   * Validates business contact and location details.
   *
   * The operating currency is independent of
   * the selected registered country.
   *
   * @returns True if all business details are valid.
   */
  const validateBusinessDetails = (): boolean => {
    const { business } = data;

    if (!isValidEmail(business.email)) {
      setError("Please enter a valid business email.");
      return false;
    }

    if (!isValidPhone(business.phone)) {
      setError(
        "Please enter a valid international phone number."
      );

      return false;
    }

    if (!isValidAddress(business.address)) {
      setError("Please enter a valid business address.");
      return false;
    }

    if (!isValidCity(business.city)) {
      setError("Please enter a valid city.");
      return false;
    }

    if (!business.country) {
      setError("Please select your country.");
      return false;
    }

    if (!business.currency) {
      setError("Please select your operating currency.");
      return false;
    }

    return true;
  };

/**
 * Validates the initial business owner's credentials.
 *
 * Checks username format and availability,
 * email, password requirements and confirmation.
 *
 * @returns True if all owner credentials are valid.
 */
const validateOwnerAccount = (): boolean => {
  const { owner } = data;

  if (!isValidUsername(owner.username)) {
    setError("Please enter a valid username.");
    return false;
  }

  if (usernameStatus !== "available") {
    setError(
      usernameStatus === "unavailable"
        ? "This username is already taken."
        : usernameStatus === "checking"
          ? "Please wait while we check your username."
          : "Unable to verify username availability."
    );

    return false;
  }

  if (!isValidEmail(owner.email)) {
    setError("Please enter a valid email address.");
    return false;
  }

  const password = validatePassword(owner.password);

  if (!password.hasMinimumLength) {
    setError(
      `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`
    );

    return false;
  }

  if (!password.hasValidByteLength) {
    setError(
      `Password cannot exceed ${MAX_PASSWORD_BYTES} bytes.`
    );

    return false;
  }

  if (
    !doPasswordsMatch(
      owner.password,
      owner.confirmPassword
    )
  ) {
    setError("Passwords do not match.");
    return false;
  }

  return true;
};

  /**
   * Validates the currently active registration step.
   *
   * @returns True when the current step is valid.
   */
  const validateStep = (): boolean => {
    setError("");

    switch (step) {
      case 1:
        return validateBusinessSetup();

      case 2:
        return validateBusinessDetails();

      case 3:
        return validateOwnerAccount();

      default:
        return false;
    }
  };

  /**
   * Advances to the next registration step or
   * submits the completed registration form.
   *
   * Earlier steps are revalidated before submission.
   * The backend performs authoritative validation.
   *
   * Successful registration redirects to login.
   */
  const handleNext = async () => {
    if (loading || !validateStep()) return;

    if (step < steps.length) {
      setStep((previous) => previous + 1);
      return;
    }

    if (!validateBusinessSetup()) {
      setStep(1);
      return;
    }

    if (!validateBusinessDetails()) {
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      await registerBusiness(data);

      navigate("/login", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns to the previous registration step
   * while preserving the entered information.
   */
  const handleBack = () => {
    if (loading) return;

    setError("");

    setStep((previous) =>
      Math.max(1, previous - 1)
    );
  };

  /**
   * Prevents users from continuing with an invalid
   * or unavailable business name.
   */
  const isContinueDisabled =
    loading ||
    (step === 1 &&
      (!isValidBusinessName(data.business.name) ||
        nameStatus !== "available"));

  return (
    <AuthLayout variant="register">
      {/* REGISTRATION PROGRESS */}

      <nav
        className={styles.progressHeader}
        aria-label="Registration progress"
      >
        {steps.map((label, index) => {
          const number = index + 1;
          const isActive = number === step;
          const isCompleted = number < step;

          return (
            <div
              className={styles.progressItem}
              key={label}
              aria-current={
                isActive ? "step" : undefined
              }
            >
              <span
                className={`${styles.progressCircle} ${
                  isActive
                    ? styles.progressCircleActive
                    : ""
                } ${
                  isCompleted
                    ? styles.progressCircleCompleted
                    : ""
                }`}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  number
                )}
              </span>

              <span className={styles.progressLabel}>
                {label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* REGISTRATION FORM */}

      <form
        className={`${sharedStyles.form} ${styles.registerForm}`}
        noValidate
        aria-busy={loading}
        onSubmit={(event) => {
          event.preventDefault();
          void handleNext();
        }}
      >
        <fieldset
          className={styles.stepViewport}
          key={step}
          disabled={loading}
          aria-label={steps[step - 1]}
        >
          {step === 1 && (
            <BusinessSetupStep
              business={data.business}
              updateBusiness={updateBusiness}
              nameStatus={nameStatus}
            />
          )}

          {step === 2 && (
            <BusinessDetailsStep
              business={data.business}
              updateBusiness={updateBusiness}
            />
          )}

         {step === 3 && (
  <OwnerAccountStep
    owner={data.owner}
    updateOwner={updateOwner}
    usernameStatus={usernameStatus}
  />
)}
        </fieldset>

        {/* VALIDATION ERRORS */}

        <div
          className={styles.errorSlot}
          aria-live="polite"
        >
          {error && (
            <p className={sharedStyles.errorMessage}>
              {error}
            </p>
          )}
        </div>

        {/* FORM NAVIGATION */}

        <div className={styles.formActions}>
          {step > 1 && (
            <button
              type="button"
              className={sharedStyles.secondaryButton}
              onClick={handleBack}
              disabled={loading}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back
            </button>
          )}

          <button
            type="submit"
            className={sharedStyles.primaryButton}
            disabled={isContinueDisabled}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className={styles.spinner}
                  aria-hidden="true"
                />
                Creating account...
              </>
            ) : step === steps.length ? (
              <>
                Create account
                <Check size={19} aria-hidden="true" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight
                  size={19}
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </div>
      </form>

      <p className={sharedStyles.footerText}>
        Already have an account?{" "}
        <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
