
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  csrfMiddleware,
} from "../src/middleware/csrfMiddleware.js";

const trustedOrigin =
  process.env.CLIENT_URL || "http://localhost:5173";

type TestResult = {
  status: number;
  nextCalled: boolean;
};

/**
 * Executes the CSRF middleware with a simulated
 * HTTP method and Origin header.
 *
 * Does not start an HTTP server or access the database.
 *
 * @param method - HTTP request method.
 * @param origin - Optional Origin header value.
 * @returns Middleware authorization result.
 */
function checkCsrf(
  method: string,
  origin?: string
): TestResult {
  let status = 200;
  let nextCalled = false;

  const request = {
    method,
    get(header: string) {
      if (header.toLowerCase() === "origin") {
        return origin;
      }

      return undefined;
    },
  } as Request;

  const response = {
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;

  const next: NextFunction = () => {
    nextCalled = true;
  };

  csrfMiddleware(request, response, next);

  return { status, nextCalled };
}

describe("Walo CSRF protection", () => {
  it("allows GET requests without an Origin header", () => {
    const result = checkCsrf("GET");

    assert.equal(result.status, 200);
    assert.equal(result.nextCalled, true);
  });

  it("allows OPTIONS preflight requests", () => {
    const result = checkCsrf("OPTIONS");

    assert.equal(result.status, 200);
    assert.equal(result.nextCalled, true);
  });

  it("allows POST requests from the trusted frontend", () => {
    const result = checkCsrf("POST", trustedOrigin);

    assert.equal(result.status, 200);
    assert.equal(result.nextCalled, true);
  });

  it("rejects POST requests from untrusted origins", () => {
    const result = checkCsrf(
      "POST",
      "https://malicious.example"
    );

    assert.equal(result.status, 403);
    assert.equal(result.nextCalled, false);
  });

  it("rejects state-changing requests without an Origin", () => {
    const result = checkCsrf("DELETE");

    assert.equal(result.status, 403);
    assert.equal(result.nextCalled, false);
  });

  it("rejects origins that imitate the trusted domain", () => {
    const result = checkCsrf(
      "PATCH",
      `${trustedOrigin}.attacker.example`
    );

    assert.equal(result.status, 403);
    assert.equal(result.nextCalled, false);
  });

  it("rejects cross-origin PUT requests", () => {
    const result = checkCsrf(
      "PUT",
      "https://another-website.example"
    );

    assert.equal(result.status, 403);
    assert.equal(result.nextCalled, false);
  });
});
