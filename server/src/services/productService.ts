import db from "../db.js";
import type { Product, CreateProduct, UpdateProduct } from "../types/product";

export async function getAllProducts(businessId: string): Promise<Product[]> {
    const result = await db.query(
        "SELECT * FROM products WHERE business_id = $1",
        [businessId]
    );

    return result.rows;
}

export async function getProductById(
    id: string,
    businessId: string
): Promise<Product | undefined> {
    const result = await db.query(
        "SELECT * FROM products WHERE id = $1 AND business_id = $2",
        [id, businessId]
    );

    return result.rows[0];
}

export async function  createProduct(businessId: string, productData: Omit<CreateProduct, "business_id">): Promise<Product>{
const {
    name,
    image_url,
    unit_id,
    quantity,
    low_stock_threshold
} = productData;

   const result = await db.query(
    `INSERT INTO products (
        business_id,
        name,
        image_url,
        unit_id,
        quantity,
        low_stock_threshold
    )
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [businessId, name, image_url, unit_id, quantity, low_stock_threshold]
);
return result.rows[0];
}

export async function updateProduct(businessId: string, id: string, productData: UpdateProduct): Promise<Product | undefined> {
    const {
        name,
        image_url,
        unit_id,
        quantity,
        low_stock_threshold
    } = productData;

    const result = await db.query(
        `UPDATE products
         SET name = COALESCE($1, name),
             image_url = COALESCE($2, image_url),
             unit_id = COALESCE($3, unit_id),
             quantity = COALESCE($4, quantity),
             low_stock_threshold = COALESCE($5, low_stock_threshold)
         WHERE id = $6 AND business_id = $7
         RETURNING *`,
        [
            name,
            image_url,
            unit_id,
            quantity,
            low_stock_threshold,
            id,
            businessId
        ]
    );

    return result.rows[0];
}

export async function deleteProduct(id: string, businessId: string): Promise<Product | undefined>{
 const result = await db.query("DELETE FROM products WHERE id = $1 AND business_id = $2 RETURNING *", 
    [id, businessId]);
 return result.rows[0];
}
