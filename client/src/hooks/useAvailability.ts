
import { useEffect, useState } from "react";

/**
 * Possible states of an availability check.
 */
export type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

/**
 * Function responsible for checking availability.
 */
type AvailabilityCheck = (
  value: string,
  signal?: AbortSignal
) => Promise<{ available: boolean }>;

/**
 * Stores the result of a completed availability check.
 */
type AvailabilityResult = {
  value: string;
  status: AvailabilityStatus;
};

/**
 * Performs reusable, debounced availability checks.
 *
 * Waits 500 milliseconds before sending a request.
 * Cancels outdated requests when the input changes
 * or the component unmounts.
 *
 * @param value - The current input value.
 * @param validate - Function that validates the input.
 * @param checkAvailability - API availability function.
 * @returns The current availability status.
 */
export function useAvailability(
  value: string,
  validate: (value: string) => boolean,
  checkAvailability: AvailabilityCheck
): AvailabilityStatus {
  const normalizedValue = value.trim();
  const isValid = validate(normalizedValue);

  const [result, setResult] =
    useState<AvailabilityResult | null>(null);

  useEffect(() => {
    if (!isValid) return;

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const data = await checkAvailability(
          normalizedValue,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setResult({
            value: normalizedValue,
            status: data.available
              ? "available"
              : "unavailable",
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({
            value: normalizedValue,
            status: "error",
          });
        }
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedValue, isValid, checkAvailability]);

  // Invalid or empty inputs remain neutral.
  if (!isValid) {
    return "idle";
  }

  // Wait for the current availability result.
  if (!result || result.value !== normalizedValue) {
    return "checking";
  }

  return result.status;
}
