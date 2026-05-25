-- ============================================================
-- Migration: 001_waitlist.sql
-- Creates the waitlist table for Milestone 1 validation
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Waitlist Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT        NOT NULL,
  pain_points TEXT[]      NOT NULL DEFAULT '{}',
  role        TEXT        CHECK (role IN ('freelancer', 'agency', 'both')),
  source      TEXT,                              -- utm_source / referrer
  ip_hash     TEXT,                              -- hashed IP for rate limiting (NOT raw IP)
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- ── Indexes ─────────────────────────────────────────────────
-- Primary key index is auto-created
CREATE INDEX idx_waitlist_email       ON public.waitlist (email);
CREATE INDEX idx_waitlist_created_at  ON public.waitlist (created_at DESC);
CREATE INDEX idx_waitlist_role        ON public.waitlist (role) WHERE role IS NOT NULL;
CREATE INDEX idx_waitlist_source      ON public.waitlist (source) WHERE source IS NOT NULL;

-- ── Row Level Security ───────────────────────────────────────
-- Waitlist is public (no auth needed to join), but only service role can read
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (join the waitlist)
CREATE POLICY "waitlist_public_insert"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role / authenticated admin can read
-- (regular users cannot read the waitlist)
CREATE POLICY "waitlist_service_select"
  ON public.waitlist
  FOR SELECT
  TO service_role
  USING (true);

-- No updates or deletes from client side
-- (managed by service role only)

-- ── Analytics View (read-only, no PII) ──────────────────────
CREATE OR REPLACE VIEW public.waitlist_stats AS
SELECT
  COUNT(*)                                          AS total_signups,
  COUNT(*) FILTER (WHERE role = 'freelancer')       AS freelancers,
  COUNT(*) FILTER (WHERE role = 'agency')           AS agencies,
  COUNT(*) FILTER (WHERE role = 'both')             AS both,
  DATE_TRUNC('day', created_at)                     AS signup_date
FROM public.waitlist
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC;

-- ── Comments ─────────────────────────────────────────────────
COMMENT ON TABLE  public.waitlist              IS 'Milestone 1 — email waitlist for validation';
COMMENT ON COLUMN public.waitlist.email        IS 'User email — unique constraint prevents duplicates';
COMMENT ON COLUMN public.waitlist.pain_points  IS 'Array of selected freelancer pain points';
COMMENT ON COLUMN public.waitlist.ip_hash      IS 'SHA-256 hash of IP for rate limiting — raw IP never stored';
