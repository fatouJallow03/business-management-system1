
import { Store, UtensilsCrossed } from "lucide-react";
import Input from "../../input/Input";
import type { BusinessData, UpdateBusiness } from "./types";
import styles from "./RegisterForm.module.scss";

type Props = {
  business: BusinessData;
  updateBusiness: UpdateBusiness;
};

export default function BusinessSetupStep({
  business,
  updateBusiness,
}: Props) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <h1>Let's get to know your business</h1>
        <p>First, tell us what kind of business you run.</p>
      </div>

      <fieldset className={styles.fieldGroup}>
        <legend className={styles.fieldLabel}>Business type</legend>

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
              onChange={() => updateBusiness("type", "restaurant")}
            />

            <span className={styles.businessTypeIcon}>
              <UtensilsCrossed
                size={26}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>

            <span className={styles.businessTypeName}>Restaurant</span>
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
              onChange={() => updateBusiness("type", "market")}
            />

            <span className={styles.businessTypeIcon}>
              <Store size={26} strokeWidth={1.8} aria-hidden="true" />
            </span>

            <span className={styles.businessTypeName}>Shop or market</span>
            <span className={styles.businessTypeDescription}>
              Retail shops, supermarkets and markets
            </span>
          </label>
        </div>
      </fieldset>

      <Input
        label="Business name"
        name="businessName"
        placeholder="e.g. Mama's Kitchen"
        value={business.name}
        onChange={(event) =>
          updateBusiness("name", event.target.value)
        }
        required
      />
    </div>
  );
}
