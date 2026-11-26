
import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireVerifiedEmail } from "../middleware/requireVerifiedEmail.js";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

/**
 * Product routes for authenticated,
 * email-verified Walo business users.
 *
 * Authentication validates the active session.
 * Email verification is required before accessing
 * any business inventory data.
 *
 * Product queries must also remain scoped
 * to the authenticated business.
 */
const router = Router();

router.use(authMiddleware);
router.use(requireVerifiedEmail);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
