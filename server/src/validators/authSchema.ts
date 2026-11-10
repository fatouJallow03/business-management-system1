import { z } from "zod";

export const registerSchema = z.object({
    business: z.object({
        name: z.string().trim().min(1),
        email: z.email(),
        phone_number: z.string().trim().min(1),
        address: z.string().trim().min(1),
        city: z.string().trim().min(1),
        country: z.string().trim().min(1),
        business_type: z.string().trim().min(1),
        currency: z.string().length(3)
    }),

    owner: z.object({
        username: z.string().trim().min(1),
        email: z.email(),
        password: z.string().min(8)
    })
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1)
});