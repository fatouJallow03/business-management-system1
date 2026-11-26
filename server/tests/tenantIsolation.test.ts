
import assert from "node:assert/strict";
import {
  before,
  after,
  describe,
  it,
} from "node:test";

import pool from "../src/db.js";

import {
  getAllProducts,
  getProductById,
} from "../src/services/productService.js";

/**
 * Minimal database fixture for tenant-isolation tests.
 *
 * Uses existing products from two different businesses.
 * Tests are read-only and do not modify any data.
 */
interface TenantProduct {
  id: string;
  business_id: string;
}

let businessA: TenantProduct;
let businessB: TenantProduct;

/**
 * Verifies that Walo's product service isolates
 * records according to the authenticated business.
 *
 * These integration tests require a test database
 * containing products from two different businesses.
 */
describe("Walo multi-tenant isolation", () => {
  before(async () => {
    const result = await pool.query<TenantProduct>(
      `SELECT DISTINCT ON (business_id)
         id,
         business_id
       FROM products
       ORDER BY business_id, id
       LIMIT 2`
    );

    assert.equal(
      result.rows.length,
      2,
      "Tests require products belonging to two different businesses."
    );

    [businessA, businessB] = result.rows;
  });

  after(async () => {
    await pool.end();
  });

  it("allows Business A to access its own product", async () => {
    const product = await getProductById(
      businessA.id,
      businessA.business_id
    );

    assert.ok(product);
    assert.equal(product.id, businessA.id);
    assert.equal(product.business_id, businessA.business_id);
  });

  it("prevents Business A from reading Business B's product", async () => {
    const product = await getProductById(
      businessB.id,
      businessA.business_id
    );

    assert.equal(product, undefined);
  });

  it("prevents Business B from reading Business A's product", async () => {
    const product = await getProductById(
      businessA.id,
      businessB.business_id
    );

    assert.equal(product, undefined);
  });

  it("restricts product lists to the requested business", async () => {
    const products = await getAllProducts(
      businessA.business_id
    );

    assert.ok(
      products.some((product) => product.id === businessA.id)
    );

    assert.ok(
      products.every(
        (product) =>
          product.business_id === businessA.business_id
      )
    );

    assert.ok(
      !products.some(
        (product) => product.id === businessB.id
      )
    );
  });
});
