
import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";

import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";

import pool from "../src/db.js";
import {
  authMiddleware,
  type AuthRequest,
  type TokenPayload,
} from "../src/middleware/authMiddleware.js";
import { AUTH_COOKIE_NAME } from "../src/config/authCookies.js";

const originalSecret = process.env.JWT_SECRET;
const testSecret = "walo-test-secret-not-for-production";

const identity: TokenPayload = {
  userId: "test-user",
  businessId: "business-a",
  role: "owner",
  sessionId: "test-session",
};

/**
 * Creates a signed test token with optional claims.
 *
 * @param claims - Authentication claims to sign.
 * @returns Signed JWT.
 */
function createToken(claims: TokenPayload = identity): string {
  return jwt.sign(claims, testSecret, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
}

/**
 * Invokes authentication middleware without starting
 * an HTTP server or modifying PostgreSQL.
 *
 * @param token - Optional authentication token.
 * @returns Status and authenticated request details.
 */
async function authenticate(token?: string) {
  const request = {
    cookies: token
      ? { [AUTH_COOKIE_NAME]: token }
      : {},
  } as AuthRequest;

  let status = 200;
  let nextCalled = false;

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

  await authMiddleware(request, response, next);

  return { status, nextCalled, user: request.user };
}

describe("Walo authentication session security", () => {
  before(() => {
    process.env.JWT_SECRET = testSecret;
  });

  after(() => {
    mock.restoreAll();

    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it("rejects requests without authentication cookies", async () => {
    const result = await authenticate();

    assert.equal(result.status, 401);
    assert.equal(result.nextCalled, false);
  });

  it("rejects invalid JWT signatures", async () => {
    const forgedToken = jwt.sign(identity, "wrong-secret", {
      algorithm: "HS256",
    });

    const result = await authenticate(forgedToken);

    assert.equal(result.status, 401);
    assert.equal(result.nextCalled, false);
  });

  it("rejects expired JWTs", async () => {
    const expiredToken = jwt.sign(identity, testSecret, {
      algorithm: "HS256",
      expiresIn: -1,
    });

    const result = await authenticate(expiredToken);

    assert.equal(result.status, 401);
    assert.equal(result.nextCalled, false);
  });

  it("rejects revoked or missing database sessions", async () => {
    const queryMock = mock.method(pool, "query", async () => ({
      rowCount: 0,
      rows: [],
    }));

    try {
      const result = await authenticate(createToken());

      assert.equal(result.status, 401);
      assert.equal(result.nextCalled, false);
      assert.equal(queryMock.mock.callCount(), 1);
    } finally {
      queryMock.mock.restore();
    }
  });

  it("rejects a token whose business does not match the session", async () => {
    const queryMock = mock.method(pool, "query", async (
      _sql: unknown,
      values?: unknown
    ) => {
      const parameters = values as unknown[];

      // Simulated database identity belongs to Business A.
      const matchingIdentity =
        parameters[0] === identity.sessionId &&
        parameters[1] === identity.userId &&
        parameters[2] === identity.businessId &&
        parameters[3] === identity.role;

      return {
        rowCount: matchingIdentity ? 1 : 0,
        rows: matchingIdentity ? [{ "?column?": 1 }] : [],
      };
    });

    try {
      const forgedClaims = {
        ...identity,
        businessId: "business-b",
      };

      const result = await authenticate(createToken(forgedClaims));

      assert.equal(result.status, 401);
      assert.equal(result.nextCalled, false);
    } finally {
      queryMock.mock.restore();
    }
  });

  it("accepts a valid token with a matching active session", async () => {
    const queryMock = mock.method(pool, "query", async () => ({
      rowCount: 1,
      rows: [{ "?column?": 1 }],
    }));

    try {
      const result = await authenticate(createToken());

      assert.equal(result.status, 200);
      assert.equal(result.nextCalled, true);
      assert.ok(result.user);

assert.equal(result.user.userId, identity.userId);
assert.equal(result.user.businessId, identity.businessId);
assert.equal(result.user.role, identity.role);
assert.equal(result.user.sessionId, identity.sessionId);
    } finally {
      queryMock.mock.restore();
    }
  });
});
