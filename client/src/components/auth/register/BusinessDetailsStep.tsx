
import { Mail, MapPin } from "lucide-react";

import Input from "../../ui/input/Input";

import {
  isValidEmail,
  isValidPhone,
  isValidAddress,
  isValidCity,
  getFieldFeedback,
} from "../../../utils/validation";

import type {
  BusinessData,
  UpdateBusiness,
  Country,
  Currency,
} from "./types";

import styles from "./RegisterForm.module.scss";

/**
 * Properties required by the business details step.
 */
type Props = {
  business: BusinessData;
  updateBusiness: UpdateBusiness;
};

/**
 * Countries currently supported by Walo.
 */
const countries = [
  { value: "Gambia", label: "Gambia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Ghana", label: "Ghana" },
] as const;

/**
 * Supported operating currencies.
 *
 * Businesses can select any supported currency,
 * independently of their registered country.
 */
const currencies = [
  { value: "GMD", label: "GMD — Gambian Dalasi" },
  { value: "XOF", label: "XOF — West African CFA Franc" },
  { value: "GHS", label: "GHS — Ghanaian Cedi" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "USD", label: "USD — US Dollar" },
] as const;

/**
 * Maps each supported country to its default currency.
 */
const defaultCurrencies: Record<
  Exclude<Country, "">,
  Currency
> = {
  Gambia: "GMD",
  Senegal: "XOF",
  Ghana: "GHS",
};

/**
 * Displays the second step of business registration.
 *
 * Collects business contact information, location
 * and the preferred operating currency.
 *
 * Uses shared validation utilities to provide
 * consistent feedback without duplicating logic.
 *
 * @param props - Business data and update function.
 * @returns The business details registration step.
 */
export default function BusinessDetailsStep({
  business,
  updateBusiness,
}: Props) {
  /**
   * Updates the registered country and suggests
   * a local currency if none has been selected.
   *
   * Preserves any existing currency selection.
   *
   * @param country - Selected business country.
   */
  const handleCountryChange = (country: Country) => {
    updateBusiness("country", country);

    if (country && !business.currency) {
      updateBusiness(
        "currency",
        defaultCurrencies[country]
      );
    }
  };

  return (
    <div className={styles.stepContent}>
      {/* STEP HEADING */}

      <div className={styles.stepHeading}>
        <h1>Where can we find your business?</h1>
        <p>Add your registered business details.</p>
      </div>

      {/* CONTACT INFORMATION */}

      <div className={styles.sectionHeading}>
        <Mail size={18} aria-hidden="true" />
        <h2>Contact information</h2>
      </div>

      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <Input
            label="Business email"
            type="email"
            name="businessEmail"
            placeholder="business@example.com"
            value={business.email}
            onChange={(event) =>
              updateBusiness("email", event.target.value)
            }
            {...getFieldFeedback(
              business.email,
              isValidEmail(business.email),
              "Enter a valid email address."
            )}
            autoComplete="email"
            required
          />

          <Input
            label="Business phone number"
            type="tel"
            name="businessPhone"
            placeholder="+220..."
            value={business.phone}
            onChange={(event) =>
              updateBusiness("phone", event.target.value)
            }
            {...getFieldFeedback(
              business.phone,
              isValidPhone(business.phone),
              "Enter an international phone number."
            )}
            autoComplete="tel"
            required
          />
        </div>
      </div>

      {/* BUSINESS LOCATION */}

      <div className={styles.sectionHeading}>
        <MapPin size={18} aria-hidden="true" />
        <h2>Business location</h2>
      </div>

      <div className={styles.fields}>
        <Input
          label="Registered business address"
          name="businessAddress"
          placeholder="Street or building address"
          value={business.address}
          onChange={(event) =>
            updateBusiness("address", event.target.value)
          }
          {...getFieldFeedback(
            business.address,
            isValidAddress(business.address),
            "Address cannot exceed 255 characters."
          )}
          autoComplete="street-address"
          required
        />

        <div className={styles.fieldRow}>
          <Input
            label="City"
            name="city"
            placeholder="e.g. Banjul"
            value={business.city}
            onChange={(event) =>
              updateBusiness("city", event.target.value)
            }
            {...getFieldFeedback(
              business.city,
              isValidCity(business.city),
              "City must contain 2–100 characters."
            )}
            autoComplete="address-level2"
            required
          />

          {/* COUNTRY */}

          <div className={styles.selectField}>
            <label htmlFor="businessCountry">
              Country *
            </label>

            <select
              id="businessCountry"
              name="businessCountry"
              value={business.country}
              onChange={(event) =>
                handleCountryChange(
                  event.target.value as Country
                )
              }
              autoComplete="country-name"
              required
            >
              <option value="">Select country</option>

              {countries.map((country) => (
                <option
                  key={country.value}
                  value={country.value}
                >
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* OPERATING CURRENCY */}

        <div className={styles.selectField}>
          <label htmlFor="businessCurrency">
            Operating currency *
          </label>

          <select
            id="businessCurrency"
            name="businessCurrency"
            value={business.currency}
            onChange={(event) =>
              updateBusiness(
                "currency",
                event.target.value as Currency
              )
            }
            required
          >
            <option value="">Select currency</option>

            {currencies.map((currency) => (
              <option
                key={currency.value}
                value={currency.value}
              >
                {currency.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
