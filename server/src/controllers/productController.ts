
import type { Request, Response } from "express";
import * as productService from "../services/productService.js";
import { updateProductSchema } from "../validators/productSchema.js";

type AuthRequest = Request & {
    user?: {
        businessId: string;
    };
};

function getBusinessId(req: AuthRequest) {
    return req.user?.businessId;
}

export async function getProducts(req: AuthRequest, res: Response) {
    console.log("GET PRODUCTS CONTROLLER REACHED");
    try {
        const businessId = getBusinessId(req);

        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
       console.log("Business ID:", businessId);
        const products = await productService.getAllProducts(businessId);
        return res.status(200).json(products);

    } catch (error) {
        return res.status(500).json({ error: "Failed to get products" });
    }
}

export async function getProduct(req: AuthRequest, res: Response) {
    try {
        const businessId = getBusinessId(req);

        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const id = String(req.params.id);
        const product = await productService.getProductById(id, businessId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json(product);

    } catch (error) {
        return res.status(500).json({ error: "Failed to get product" });
    }
}

export async function createProduct(req: AuthRequest, res: Response) {
    try {
        const businessId = getBusinessId(req);

        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const newProduct = await productService.createProduct(
            businessId,
            req.body
        );

        return res.status(201).json(newProduct);

   } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
        error: "Failed to create product"
    });
}
}

export async function updateProduct(req: AuthRequest, res: Response) {
    try {
        const businessId = getBusinessId(req);

        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validation = updateProductSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: validation.error.flatten()
            });
        }

        const updatedProduct = await productService.updateProduct(
            businessId,
            String(req.params.id),
            validation.data
        );

        if (!updatedProduct) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        return res.status(200).json(updatedProduct);

    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);

        return res.status(500).json({
            error: "Failed to update product"
        });
    }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
    try {
        const businessId = getBusinessId(req);

        if (!businessId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const id = String(req.params.id);

        const deletedProduct = await productService.deleteProduct(
            id,
            businessId
        );

        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json(deletedProduct);

    } catch (error) {
        return res.status(500).json({ error: "Failed to delete product" });
    }
}
