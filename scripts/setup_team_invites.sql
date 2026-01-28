-- ============================================================================
-- TEAM INVITES: Add columns required for email invitations + staff login
-- ============================================================================
-- Run this in Supabase SQL Editor. Safe to run multiple times (idempotent).

-- Add columns (IF NOT EXISTS – no DO blocks, no schema cache issues)
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invite_token TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Mark existing members (no invite) as active; new invited rows stay 'pending'
UPDATE team_members SET status = 'active' WHERE invite_token IS NULL;

-- Indexes for invite + staff login
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_username ON team_members(username);

-- Comments
COMMENT ON COLUMN team_members.username IS 'Login username for staff';
COMMENT ON COLUMN team_members.permissions IS 'JSON array of permission slugs (e.g. stock_keys, manage_products)';
COMMENT ON COLUMN team_members.invite_token IS 'Unique token for invitation link';
COMMENT ON COLUMN team_members.invite_expires_at IS 'When the invite link expires';
COMMENT ON COLUMN team_members.password_hash IS 'Staff login password (hash in production)';
COMMENT ON COLUMN team_members.status IS 'pending = invited, active = accepted, inactive = disabled';
COMMENT ON COLUMN team_members.updated_at IS 'Last updated';
