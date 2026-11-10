
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

import BusinessSetupStep from "./BusinessSetupStep";
import BusinessDetailsStep from "./BusinessDetailsStep";
import OwnerAccountStep from "./OwnerAccountStep";
import RegistrationVisual from "./RegistrationVisual";

import type {
  RegistrationData,
  BusinessData,
  OwnerData,
} from "./types";

import styles from "./RegisterForm.module.scss";

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
  },
};

const steps = ["Your business", "Business details", "Owner account"];

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(initialData);
  const [error, setError] = useState("");

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

  const validateStep = (): boolean => {
    const { business, owner } = data;

    if (step === 1 && !business.name.trim()) {
      setError("Please enter your business name.");
      return false;
    }

    if (step === 2) {
      if (
        !business.email.trim() ||
        !business.phone.trim() ||
        !business.address.trim() ||
        !business.city.trim() ||
        !business.country ||
        !business.currency
      ) {
        setError("Please complete all business details.");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email.trim())) {
        setError("Please enter a valid business email.");
        return false;
      }
    }

    if (step === 3) {
      if (
        !owner.username.trim() ||
        !owner.email.trim() ||
        !owner.password
      ) {
        setError("Please complete your owner account.");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email.trim())) {
        setError("Please enter a valid owner email.");
        return false;
      }

      if (owner.password.length < 8) {
        setError("Your password must be at least 8 characters.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < 3) {
      setStep((previous) => previous + 1);
    } else {
      // TODO: Connect to Express registration endpoint.
      setError("Registration API is not connected yet.");
    }
  };

  const handleBack = () => {
    setError("");
    setStep((previous) => Math.max(1, previous - 1));
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <RegistrationVisual />

        <section className={styles.formPanel}>
          <div className={styles.formContainer}>
            <nav
              className={styles.progressHeader}
              aria-label="Registration progress"
            >
              {steps.map((label, index) => {
                const number = index + 1;
                const isActive = number === step;
                const isCompleted = number < step;

                return (
                  <div className={styles.progressItem} key={label}>
                    <span
                      className={`${styles.progressCircle} ${
                        isActive ? styles.progressCircleActive : ""
                      } ${
                        isCompleted ? styles.progressCircleCompleted : ""
                      }`}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {isCompleted ? <Check size={16} /> : number}
                    </span>
                    <span className={styles.progressLabel}>{label}</span>
                  </div>
                );
              })}
            </nav>

            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                handleNext();
              }}
            >
              {step === 1 && (
                <BusinessSetupStep
                  business={data.business}
                  updateBusiness={updateBusiness}
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
                />
              )}

              {error && (
                <p className={styles.errorMessage} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.formActions}>
                {step > 1 && (
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Back
                  </button>
                )}

                <button type="submit" className={styles.nextButton}>
                  {step === 3 ? (
                    <>
                      Create account
                      <Check size={19} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={19} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className={styles.signInText}>
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
          <div className={styles.mobilePattern} aria-hidden="true" />
        </section>
      </div>
    </div>
  );
}
