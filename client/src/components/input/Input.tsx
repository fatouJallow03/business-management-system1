
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  required,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error && inputId ? `${inputId}-error` : undefined
        }
      />

      {error && (
        <span
          id={inputId ? `${inputId}-error` : undefined}
          className={styles.error}
        >
          {error}
        </span>
      )}
    </div>
  );
}
