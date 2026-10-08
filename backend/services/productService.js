const db = require("../db");

async function getAllProducts() {
    const result = await db.query("SELECT * FROM products");
    return result.rows;
}

async function  getProductById(id){
    const result = await db.query("SELECT * FROM products WHERE id = $1", 
        [id]
    );
    return result.rows[0];
}

async function  createProduct(productData){
const {
    business_id,
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
    [business_id, name, image_url, unit_id, quantity, low_stock_threshold]
);
return result.rows[0];
}

async function updateProduct(id, productData) {
    const {
        name,
        image_url,
        unit_id,
        quantity,
        low_stock_threshold
    } = productData;

    const result = await db.query(
        `UPDATE products
         SET name = $1,
             image_url = $2,
             unit_id = $3,
             quantity = $4,
             low_stock_threshold = $5
         WHERE id = $6
         RETURNING *`,
        [
            name,
            image_url,
            unit_id,
            quantity,
            low_stock_threshold,
            id
        ]
    );

    return result.rows[0];
}

async function deleteProduct(id){
 const result = await db.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
 return result.rows[0];
}
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct

};