
import { useId, type InputHTMLAttributes } from "react";

import {
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import styles from "./Input.module.scss";

/**
 * Supported input validation states.
 */
type ValidationStatus =
  | "idle"
  | "checking"
  | "success"
  | "error";

/**
 * Properties supported by the reusable Input component.
 *
 * Extends native HTML input attributes.
 */
interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  message?: string;
  status?: ValidationStatus;
}

/**
 * Displays a reusable and accessible input field.
 *
 * Supports native input attributes, validation states,
 * availability checks and accessible feedback messages.
 *
 * @param props - Input attributes and validation properties.
 * @returns A styled input field with optional feedback.
 */
export default function Input({
  label,
  error,
  message,
  status = "idle",
  id,
  required,
  className = "",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const currentStatus = error ? "error" : status;
  const feedback = error || message;

  /**
   * Combines the base input style with optional
   * validation styles and external class names.
   */
  const inputClassName = [
    styles.input,
    currentStatus === "success" ? styles.success : "",
    currentStatus === "error" ? styles.error : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      {/* INPUT LABEL */}

      <label htmlFor={inputId}>
        {label}

        {required && (
          <span
            className={styles.required}
            aria-hidden="true"
          >
            {" "}*
          </span>
        )}
      </label>

      {/* INPUT CONTROL */}

      <input
        {...props}
        id={inputId}
        required={required}
        className={inputClassName}
        aria-invalid={currentStatus === "error"}
        aria-describedby={
          [
            props["aria-describedby"],
            feedback
              ? `${inputId}-feedback`
              : undefined,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />

      {/* VALIDATION FEEDBACK */}

      {(feedback || currentStatus === "checking") && (
        <div
          id={`${inputId}-feedback`}
          className={`${styles.feedback} ${
            styles[`${currentStatus}Feedback`]
          }`}
          aria-live="polite"
        >
          {currentStatus === "checking" && (
            <LoaderCircle
              size={15}
              className={styles.spinner}
              aria-hidden="true"
            />
          )}

          {currentStatus === "success" && (
            <CheckCircle2
              size={15}
              aria-hidden="true"
            />
          )}

          {currentStatus === "error" && (
            <AlertCircle
              size={15}
              aria-hidden="true"
            />
          )}

          {feedback}
        </div>
      )}
    </div>
  );
}
