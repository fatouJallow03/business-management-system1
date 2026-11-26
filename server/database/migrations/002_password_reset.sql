
-- Migration 002: Secure password reset tokens
--
-- Stores hashed, single-use password reset tokens.
-- Plain-text reset tokens must never be stored
-- in PostgreSQL.

BEGIN;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supports efficient token lookup.
CREATE INDEX IF NOT EXISTS
    idx_password_reset_tokens_user_id
ON password_reset_tokens(user_id);

-- Supports expiration and token cleanup.
CREATE INDEX IF NOT EXISTS
    idx_password_reset_tokens_expires_at
ON password_reset_tokens(expires_at);

COMMIT;
