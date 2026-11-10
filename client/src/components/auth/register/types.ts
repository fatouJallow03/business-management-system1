
export type BusinessType = "restaurant" | "market";

export interface RegistrationData {
  business: {
    name: string;
    type: BusinessType | "";
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    currency: string;
  };
  owner: {
    username: string;
    email: string;
    password: string;
  };
}

export type BusinessData = RegistrationData["business"];
export type OwnerData = RegistrationData["owner"];

export type UpdateBusiness = (
  field: keyof BusinessData,
  value: string
) => void;

export type UpdateOwner = (
  field: keyof OwnerData,
  value: string
) => void;
