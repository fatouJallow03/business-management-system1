
/**
 * Business types currently supported by Walo.
 */
export type BusinessType = "restaurant" | "market" | "";

/**
 * Countries where businesses can register.
 */
export type Country = "Gambia" | "Senegal" | "Ghana" | "";

/**
 * Supported operating currencies.
 *
 * Businesses can select a currency independently
 * of their registered country.
 */
export type Currency =
  | "GMD"
  | "XOF"
  | "GHS"
  | "EUR"
  | "GBP"
  | "USD"
  | "";

/**
 * Represents the business information collected
 * during the registration process.
 */
export interface BusinessData {
  name: string;
  type: BusinessType;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: Country;
  currency: Currency;
}

/**
 * Represents the initial business owner's credentials.
 *
 * Password confirmation is used for validation
 * and must never be stored in the database.
 */
export interface OwnerData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Represents the complete registration form data.
 */
export interface RegistrationData {
  business: BusinessData;
  owner: OwnerData;
}

/**
 * Updates an individual business field while
 * preserving its TypeScript data type.
 */
export type UpdateBusiness = <K extends keyof BusinessData>(
  field: K,
  value: BusinessData[K]
) => void;

/**
 * Updates an individual owner account field while
 * preserving its TypeScript data type.
 */
export type UpdateOwner = <K extends keyof OwnerData>(
  field: K,
  value: OwnerData[K]
) => void;
