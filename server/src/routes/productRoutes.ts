
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
