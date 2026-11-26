
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import pool from "../src/db.js";

import {
  updateProduct,
  deleteProduct,
} from "../src/services/productService.js";

/**
 * Ensures write operations remain scoped to
 * the authenticated business.
 *
 * Database calls are mocked to prevent changes
 * to development or customer records.
 */
describe("Walo tenant write isolation", () => {
  const businessA = "business-a";
  const productFromBusinessB = "product-b";

  it("scopes product updates by business ID", async () => {
    const queryMock = mock.method(
      pool,
      "query",
      async () => ({
        rows: [],
        rowCount: 0,
      })
    );

    try {
      const result = await updateProduct(
        businessA,
        productFromBusinessB,
        { name: "Unauthorized update" }
      );

      assert.equal(result, undefined);
      assert.equal(queryMock.mock.callCount(), 1);

      const [sql, parameters] =
        queryMock.mock.calls[0].arguments;

      assert.match(
        String(sql),
        /WHERE\s+id\s*=\s*\$6\s+AND\s+business_id\s*=\s*\$7/i
      );

      assert.ok(Array.isArray(parameters));

const values = parameters;
      assert.equal(values[5], productFromBusinessB);
      assert.equal(values[6], businessA);
    } finally {
      queryMock.mock.restore();
    }
  });

  it("scopes product deletions by business ID", async () => {
    const queryMock = mock.method(
      pool,
      "query",
      async () => ({
        rows: [],
        rowCount: 0,
      })
    );

    try {
      const result = await deleteProduct(
        productFromBusinessB,
        businessA
      );

      assert.equal(result, undefined);
      assert.equal(queryMock.mock.callCount(), 1);

      const [sql, parameters] =
        queryMock.mock.calls[0].arguments;

      assert.match(
        String(sql),
        /WHERE\s+id\s*=\s*\$1\s+AND\s+business_id\s*=\s*\$2/i
      );

      assert.deepEqual(parameters, [
        productFromBusinessB,
        businessA,
      ]);
    } finally {
      queryMock.mock.restore();
    }
  });
});
