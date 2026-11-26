
-- =====================================================
-- WALO: Authentication Security Migration
-- Version: 001
--
-- Adds database-backed authentication sessions
-- and email verification.
--
-- Designed to be safe to run against databases
-- where these structures already exist.
-- =====================================================

BEGIN;

-- 1. Store email verification status.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS
    email_verified_at TIMESTAMPTZ;

-- 2. Store authentication sessions.
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    CONSTRAINT valid_session_expiry
        CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS
    idx_user_sessions_user_id
ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS
    idx_user_sessions_expires_at
ON user_sessions(expires_at);

-- 3. Store single-use email verification tokens.
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,

    CONSTRAINT valid_email_verification_expiry
        CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS
    idx_email_verification_user_id
ON email_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS
    idx_email_verification_expiry
ON email_verification_tokens(expires_at);

COMMIT;
