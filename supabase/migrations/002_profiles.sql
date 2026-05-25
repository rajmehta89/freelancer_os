-- ============================================================
-- Migration: 002_profiles.sql
-- User profiles table — auto-created on signup via trigger
-- ============================================================

-- ── Profiles Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  plan          TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  proposals_used INT        NOT NULL DEFAULT 0,
  replies_used   INT        NOT NULL DEFAULT 0,
  onboarded     BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_profiles_email    ON public.profiles (email);
CREATE INDEX idx_profiles_plan     ON public.profiles (plan);
CREATE INDEX idx_profiles_created  ON public.profiles (created_at DESC);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/update only their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin ops)
CREATE POLICY "profiles_service_all"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Auto-create profile on signup ───────────────────────────
-- This trigger fires when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Comments ─────────────────────────────────────────────────
COMMENT ON TABLE  public.profiles           IS 'One row per user — auto-created on signup via trigger';
COMMENT ON COLUMN public.profiles.plan      IS 'free | pro | agency — updated by Razorpay webhook';
COMMENT ON COLUMN public.profiles.onboarded IS 'true after user completes onboarding flow';
