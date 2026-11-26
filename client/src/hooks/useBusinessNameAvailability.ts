
import { useEffect, useState } from "react";
import { checkBusinessName } from "../api/auth";

type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

export function useBusinessNameAvailability(name: string) {
  const [result, setResult] = useState<{
    name: string;
    status: AvailabilityStatus;
  }>({
    name: "",
    status: "idle",
  });

  const businessName = name.trim();

  useEffect(() => {
    if (!businessName || businessName.length > 100) {
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const data = await checkBusinessName(
          businessName,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setResult({
            name: businessName,
            status: data.available
              ? "available"
              : "unavailable",
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({
            name: businessName,
            status: "error",
          });
        }
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [businessName]);

  const status: AvailabilityStatus =
    !businessName || businessName.length > 100
      ? "idle"
      : result.name !== businessName
        ? "checking"
        : result.status;

  return status;
}
