
import { Mail, MapPin } from "lucide-react";
import Input from "../../input/Input";
import type { BusinessData, UpdateBusiness } from "./types";
import styles from "./RegisterForm.module.scss";

type Props = {
  business: BusinessData;
  updateBusiness: UpdateBusiness;
};

export default function BusinessDetailsStep({
  business,
  updateBusiness,
}: Props) {
  const handleCountryChange = (country: string) => {
    updateBusiness("country", country);

    if (country === "Gambia") {
      updateBusiness("currency", "GMD");
    } else if (country === "Senegal") {
      updateBusiness("currency", "XOF");
    } else {
      updateBusiness("currency", "");
    }
  };

  return (
    <div className={styles.stepContent}>
      {/* Heading */}
      <div className={styles.stepHeading}>
        <h1>Where can we find your business?</h1>
        <p>Add your registered business details.</p>
      </div>

      {/* Contact information */}
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
            onChange={(e) =>
              updateBusiness("email", e.target.value)
            }
            autoComplete="email"
            required
          />

          <Input
            label="Business phone number"
            type="tel"
            name="businessPhone"
            placeholder="+220 ..."
            value={business.phone}
            onChange={(e) =>
              updateBusiness("phone", e.target.value)
            }
            autoComplete="tel"
            required
          />
        </div>
      </div>

      {/* Business location */}
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
          onChange={(e) =>
            updateBusiness("address", e.target.value)
          }
          autoComplete="street-address"
          required
        />

        <div className={styles.fieldRow}>
          <Input
            label="City"
            name="city"
            placeholder="e.g. Banjul"
            value={business.city}
            onChange={(e) =>
              updateBusiness("city", e.target.value)
            }
            autoComplete="address-level2"
            required
          />

          <div className={styles.selectField}>
            <label htmlFor="businessCountry">
              Country
            </label>

            <select
              id="businessCountry"
              name="businessCountry"
              value={business.country}
              onChange={(e) =>
                handleCountryChange(e.target.value)
              }
              autoComplete="country-name"
              required
            >
              <option value="">Select country</option>
              <option value="Gambia">Gambia</option>
              <option value="Senegal">Senegal</option>
            </select>
          </div>
        </div>

        <div className={styles.selectField}>
          <label htmlFor="businessCurrency">
            Currency
          </label>

          <select
            id="businessCurrency"
            name="businessCurrency"
            value={business.currency}
            onChange={(e) =>
              updateBusiness("currency", e.target.value)
            }
            required
          >
            <option value="">Select currency</option>
            <option value="GMD">
              GMD — Gambian Dalasi
            </option>
            <option value="XOF">
              XOF — West African CFA Franc
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
