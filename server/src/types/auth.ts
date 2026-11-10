export type RegisterBusiness = {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    city: string;
    country: string;
    business_type: string;
    currency: string;
};

export type RegisterOwner = {
    username: string;
    email: string;
    password: string;
};