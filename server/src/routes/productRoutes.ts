
import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireVerifiedEmail } from "../middleware/requireVerifiedEmail.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

/**
 * Product routes protected by Walo's
 * authentication, email verification,
 * and role-based authorization.
 *
 * Every product operation must also
 * enforce business-level data isolation
 * inside the service layer.
 */
const router = Router();

// Require a valid authenticated session.
router.use(authMiddleware);

// Require verified business-user email.
router.use(requireVerifiedEmail);

// All authenticated roles may view products.
router.get(
  "/",
  roleMiddleware("owner", "manager", "employee"),
  getProducts
);

router.get(
  "/:id",
  roleMiddleware("owner", "manager", "employee"),
  getProduct
);

// Owners and managers may create products.
router.post(
  "/",
  roleMiddleware("owner", "manager"),
  createProduct
);

// Owners and managers may update products.
router.patch(
  "/:id",
  roleMiddleware("owner", "manager"),
  updateProduct
);

// Only owners may delete products.
router.delete(
  "/:id",
  roleMiddleware("owner"),
  deleteProduct
);

export default router;
