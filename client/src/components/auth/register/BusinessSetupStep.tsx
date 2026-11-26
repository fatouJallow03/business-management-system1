
import { Store, UtensilsCrossed } from "lucide-react";


import type {
  BusinessData,
  UpdateBusiness,
} from "./types";

import styles from "./RegisterForm.module.scss";
import Input from "../../ui/input/Input";

/**
 * Represents the possible results of a business
 * name availability check.
 */
type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

/**
 * Properties required by the first registration step.
 */
type Props = {
  business: BusinessData;
  updateBusiness: UpdateBusiness;
  nameStatus: AvailabilityStatus;
};

/**
 * Converts business name validation and availability
 * results into feedback understood by the Input component.
 *
 * @param name - The requested business name.
 * @param nameStatus - Current availability status.
 * @returns Input validation status and feedback message.
 */
function getNameFeedback(
  name: string,
  nameStatus: AvailabilityStatus
): {
  status: "idle" | "checking" | "success" | "error";
  message: string;
} {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      status: "idle",
      message: "",
    };
  }

  if (trimmedName.length < 2) {
    return {
      status: "error",
      message: "Enter at least 2 characters.",
    };
  }

  if (trimmedName.length > 100) {
    return {
      status: "error",
      message: "Business name cannot exceed 100 characters.",
    };
  }

  if (!/[\p{L}\p{N}]/u.test(trimmedName)) {
    return {
      status: "error",
      message: "Business name must contain a letter or number.",
    };
  }

  switch (nameStatus) {
    case "checking":
      return {
        status: "checking",
        message: "Checking availability...",
      };

    case "available":
      return {
        status: "success",
        message: "Business name is available.",
      };

    case "unavailable":
      return {
        status: "error",
        message: "This business name is already taken.",
      };

    case "error":
      return {
        status: "error",
        message: "Unable to check availability. Try editing the name.",
      };

    default:
      return {
        status: "idle",
        message: "",
      };
  }
}

/**
 * Displays the first step of Walo's registration.
 *
 * Allows users to select their business type and
 * enter a unique business name.
 *
 * All form data is managed by the parent
 * RegisterForm component.
 *
 * @param props - Business data, update function and name status.
 * @returns The business setup registration step.
 */
export default function BusinessSetupStep({
  business,
  updateBusiness,
  nameStatus,
}: Props) {
  const feedback = getNameFeedback(
    business.name,
    nameStatus
  );

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <h1>Let's get to know your business</h1>
        <p>First, tell us what kind of business you run.</p>
      </div>

      <fieldset className={styles.fieldGroup}>
        <legend className={styles.fieldLabel}>
          Business type
        </legend>

        <div className={styles.businessTypes}>
          <label
            className={`${styles.businessTypeCard} ${
              business.type === "restaurant"
                ? styles.businessTypeSelected
                : ""
            }`}
          >
            <input
              type="radio"
              name="businessType"
              value="restaurant"
              checked={business.type === "restaurant"}
              onChange={() =>
                updateBusiness("type", "restaurant")
              }
            />

            <span className={styles.businessTypeIcon}>
              <UtensilsCrossed
                size={26}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>

            <span className={styles.businessTypeName}>
              Restaurant
            </span>

            <span className={styles.businessTypeDescription}>
              Restaurants, cafés and food businesses
            </span>
          </label>

          <label
            className={`${styles.businessTypeCard} ${
              business.type === "market"
                ? styles.businessTypeSelected
                : ""
            }`}
          >
            <input
              type="radio"
              name="businessType"
              value="market"
              checked={business.type === "market"}
              onChange={() =>
                updateBusiness("type", "market")
              }
            />

            <span className={styles.businessTypeIcon}>
              <Store
                size={26}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>

            <span className={styles.businessTypeName}>
              Shop or market
            </span>

            <span className={styles.businessTypeDescription}>
              Retail shops, supermarkets and markets
            </span>
          </label>
        </div>
      </fieldset>

      <div className={styles.businessNameField}>
        <Input
          label="Business name"
          name="businessName"
          placeholder="e.g. Mama's Kitchen"
          value={business.name}
          onChange={(e) =>
            updateBusiness("name", e.target.value)
          }
          status={feedback.status}
          message={feedback.message}
          autoComplete="organization"
          required
        />
      </div>
    </div>
  );
}
