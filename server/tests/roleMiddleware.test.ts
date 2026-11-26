
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  Response,
  NextFunction,
} from "express";

import {
  roleMiddleware,
} from "../src/middleware/roleMiddleware.js";

import type {
  AuthRequest,
  UserRole,
} from "../src/middleware/authMiddleware.js";

/**
 * Creates a minimal authenticated request for
 * testing role-based authorization.
 *
 * @param role - Optional authenticated user role.
 * @returns Mock Express request.
 */
function createRequest(
  role?: UserRole
): AuthRequest {
  return {
    user: role
      ? {
          userId: "test-user",
          businessId: "test-business",
          sessionId: "test-session",
          role,
        }
      : undefined,
  } as AuthRequest;
}

/**
 * Creates a mock Express response that records
 * the HTTP status code.
 *
 * @returns Response and captured status.
 */
function createResponse() {
  let statusCode = 200;

  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;

  return {
    response,
    getStatus: () => statusCode,
  };
}

describe("Walo role-based authorization", () => {
  it("rejects unauthenticated users", () => {
    const { response, getStatus } = createResponse();

    let nextCalled = false;

    const next = (() => {
      nextCalled = true;
    }) as NextFunction;

    roleMiddleware("owner")(
      createRequest(),
      response,
      next
    );

    assert.equal(getStatus(), 401);
    assert.equal(nextCalled, false);
  });

  it("rejects employees from owner-only operations", () => {
    const { response, getStatus } = createResponse();

    let nextCalled = false;

    const next = (() => {
      nextCalled = true;
    }) as NextFunction;

    roleMiddleware("owner")(
      createRequest("employee"),
      response,
      next
    );

    assert.equal(getStatus(), 403);
    assert.equal(nextCalled, false);
  });

  it("allows owners to perform owner-only operations", () => {
    const { response, getStatus } = createResponse();

    let nextCalled = false;

    const next = (() => {
      nextCalled = true;
    }) as NextFunction;

    roleMiddleware("owner")(
      createRequest("owner"),
      response,
      next
    );

    assert.equal(getStatus(), 200);
    assert.equal(nextCalled, true);
  });

  it("allows managers when explicitly permitted", () => {
    const { response, getStatus } = createResponse();

    let nextCalled = false;

    const next = (() => {
      nextCalled = true;
    }) as NextFunction;

    roleMiddleware("owner", "manager")(
      createRequest("manager"),
      response,
      next
    );

    assert.equal(getStatus(), 200);
    assert.equal(nextCalled, true);
  });
});
