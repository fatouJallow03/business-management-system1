import { z } from "zod";

export const createProductSchema = z.object({
    business_id: z.uuid(),
    name: z.string().trim().min(1).max(100),
    image_url: z.url().nullable(),
    unit_id: z.uuid(),
    quantity: z.number().min(0),
    low_stock_threshold: z.number().min(0)
});


export const updateProductSchema = createProductSchema
    .omit({ business_id: true })
    .partial();