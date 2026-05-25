-- ============================================================
-- Migration: 003_core_tables.sql
-- Core application tables for FreelancerOS
-- Run AFTER 001_waitlist.sql and 002_profiles.sql
-- ============================================================

-- ── Reusable updated_at trigger (already created in 002, safe to re-run) ──
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- ============================================================
-- 1. PROPOSALS
-- Stores every AI-generated proposal with full input + output
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Input (what the user pasted)
  job_post        TEXT        NOT NULL,
  client_name     TEXT,
  job_url         TEXT,
  platform        TEXT        NOT NULL DEFAULT 'upwork'
                  CHECK (platform IN ('upwork','freelancer','toptal','direct','other')),

  -- Generated output
  title           TEXT,
  generated_text  TEXT        NOT NULL,
  style           TEXT        NOT NULL DEFAULT 'concise'
                  CHECK (style IN ('concise','technical','premium','agency')),

  -- AI generation metadata (never store prompt/response content here)
  model           TEXT,
  tokens_input    INT,
  tokens_output   INT,
  generation_ms   INT,
  ai_score        SMALLINT    CHECK (ai_score BETWEEN 1 AND 10),

  -- Lifecycle status
  status          TEXT        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','replied','won','lost','archived')),
  sent_at         TIMESTAMPTZ,
  won_at          TIMESTAMPTZ,

  -- Notes (user-added)
  notes           TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposals_user_id        ON public.proposals (user_id);
CREATE INDEX idx_proposals_user_created   ON public.proposals (user_id, created_at DESC);
CREATE INDEX idx_proposals_status         ON public.proposals (status);
CREATE INDEX idx_proposals_user_status    ON public.proposals (user_id, status);
CREATE INDEX idx_proposals_platform       ON public.proposals (platform);
CREATE INDEX idx_proposals_sent_at        ON public.proposals (sent_at DESC) WHERE sent_at IS NOT NULL;

-- updated_at trigger
CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_owner_all"
  ON public.proposals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposals_service_all"
  ON public.proposals FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE  public.proposals              IS 'AI-generated proposals — one row per generation';
COMMENT ON COLUMN public.proposals.job_post     IS 'Raw job post pasted by user — input to AI';
COMMENT ON COLUMN public.proposals.ai_score     IS '1-10 quality score assigned by AI on generation';
COMMENT ON COLUMN public.proposals.status       IS 'draft→sent→replied→won/lost lifecycle';


-- ============================================================
-- 2. CLIENT REPLIES
-- AI-generated replies to client messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.client_replies (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id     UUID        REFERENCES public.proposals(id) ON DELETE SET NULL,

  -- Input
  client_message  TEXT        NOT NULL,
  reply_type      TEXT        NOT NULL
                  CHECK (reply_type IN ('lowball','followup','negotiation','delay','upsell','general')),
  context         TEXT,       -- extra context user provides

  -- Generated output
  generated_reply TEXT        NOT NULL,

  -- AI metadata
  model           TEXT,
  tokens_input    INT,
  tokens_output   INT,
  generation_ms   INT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_replies_user_id      ON public.client_replies (user_id);
CREATE INDEX idx_replies_user_created ON public.client_replies (user_id, created_at DESC);
CREATE INDEX idx_replies_proposal_id  ON public.client_replies (proposal_id) WHERE proposal_id IS NOT NULL;
CREATE INDEX idx_replies_type         ON public.client_replies (reply_type);

-- updated_at trigger
CREATE TRIGGER client_replies_updated_at
  BEFORE UPDATE ON public.client_replies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.client_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "replies_owner_all"
  ON public.client_replies FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "replies_service_all"
  ON public.client_replies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE  public.client_replies             IS 'AI-generated client reply messages';
COMMENT ON COLUMN public.client_replies.reply_type  IS 'lowball|followup|negotiation|delay|upsell|general';


-- ============================================================
-- 3. PROJECT ESTIMATES
-- AI-generated project timelines and pricing breakdowns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_estimates (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id         UUID    REFERENCES public.proposals(id) ON DELETE SET NULL,

  -- Input
  project_description TEXT    NOT NULL,
  requirements        TEXT,
  tech_stack          TEXT[]  DEFAULT '{}',

  -- Generated output
  timeline_days       INT,
  min_price           INT,     -- in user's currency (cents/paise)
  max_price           INT,
  currency            TEXT    NOT NULL DEFAULT 'USD',
  complexity          TEXT    CHECK (complexity IN ('simple','medium','complex','enterprise')),
  milestones          JSONB   DEFAULT '[]',   -- [{title, days, price, description}]
  risks               JSONB   DEFAULT '[]',   -- [{title, mitigation}]
  tech_recommendations TEXT,

  -- AI metadata
  model               TEXT,
  tokens_input        INT,
  tokens_output       INT,
  generation_ms       INT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_estimates_user_id      ON public.project_estimates (user_id);
CREATE INDEX idx_estimates_user_created ON public.project_estimates (user_id, created_at DESC);
CREATE INDEX idx_estimates_proposal_id  ON public.project_estimates (proposal_id) WHERE proposal_id IS NOT NULL;
CREATE INDEX idx_estimates_complexity   ON public.project_estimates (complexity);

-- updated_at trigger
CREATE TRIGGER estimates_updated_at
  BEFORE UPDATE ON public.project_estimates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.project_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimates_owner_all"
  ON public.project_estimates FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estimates_service_all"
  ON public.project_estimates FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE  public.project_estimates            IS 'AI-generated project timelines and pricing';
COMMENT ON COLUMN public.project_estimates.milestones IS 'JSONB array: [{title, days, price, description}]';


-- ============================================================
-- 4. TEMPLATES
-- Reusable saved proposal/reply templates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title           TEXT    NOT NULL,
  type            TEXT    NOT NULL
                  CHECK (type IN ('proposal','reply','estimate')),
  content         TEXT    NOT NULL,
  tags            TEXT[]  DEFAULT '{}',
  is_default      BOOLEAN NOT NULL DEFAULT false,
  is_public       BOOLEAN NOT NULL DEFAULT false,  -- future: template marketplace
  usage_count     INT     NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_user_id      ON public.templates (user_id);
CREATE INDEX idx_templates_user_type    ON public.templates (user_id, type);
CREATE INDEX idx_templates_user_created ON public.templates (user_id, created_at DESC);
CREATE INDEX idx_templates_tags         ON public.templates USING GIN (tags);
CREATE INDEX idx_templates_public       ON public.templates (is_public) WHERE is_public = true;

-- updated_at trigger
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Users see their own templates + public templates
CREATE POLICY "templates_owner_all"
  ON public.templates FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "templates_public_read"
  ON public.templates FOR SELECT TO authenticated
  USING (is_public = true);

CREATE POLICY "templates_service_all"
  ON public.templates FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE  public.templates           IS 'User-saved reusable proposal and reply templates';
COMMENT ON COLUMN public.templates.is_public IS 'Future: allow sharing to template marketplace';


-- ============================================================
-- 5. SUBSCRIPTIONS
-- Razorpay subscription state per user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Razorpay identifiers
  razorpay_subscription_id  TEXT    UNIQUE,
  razorpay_customer_id      TEXT,
  razorpay_plan_id          TEXT,

  -- Plan info
  plan                      TEXT    NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','pro','agency')),
  status                    TEXT    NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','cancelled','expired','past_due','trialing')),

  -- Billing period
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT false,
  cancelled_at              TIMESTAMPTZ,

  -- Pricing (stored for audit)
  amount                    INT,        -- in paise (INR × 100)
  currency                  TEXT        NOT NULL DEFAULT 'INR',

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT subscriptions_one_per_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id        ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_razorpay_id    ON public.subscriptions (razorpay_subscription_id) WHERE razorpay_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status         ON public.subscriptions (status);
CREATE INDEX idx_subscriptions_plan           ON public.subscriptions (plan);
CREATE INDEX idx_subscriptions_period_end     ON public.subscriptions (current_period_end) WHERE current_period_end IS NOT NULL;

-- updated_at trigger
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_owner_select"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (Razorpay webhook handler)
CREATE POLICY "subscriptions_service_all"
  ON public.subscriptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE  public.subscriptions            IS 'Razorpay subscription state — updated by webhook only';
COMMENT ON COLUMN public.subscriptions.amount     IS 'Amount in paise (INR × 100), stored for audit';

-- Auto-create free subscription row when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_user_subscription_init
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscription();


-- ============================================================
-- 6. USAGE LOGS
-- Immutable audit log of every AI generation
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  action_type     TEXT    NOT NULL
                  CHECK (action_type IN (
                    'proposal_generated',
                    'reply_generated',
                    'estimate_generated',
                    'template_saved'
                  )),

  -- AI stats only — NEVER log prompt or response content
  model           TEXT,
  tokens_input    INT,
  tokens_output   INT,
  latency_ms      INT,

  -- Link to generated item
  reference_id    UUID,   -- proposal_id, reply_id, estimate_id, template_id
  reference_type  TEXT,   -- 'proposals' | 'client_replies' | 'project_estimates' | 'templates'

  -- No updated_at — logs are immutable
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_user_id      ON public.usage_logs (user_id);
CREATE INDEX idx_usage_user_created ON public.usage_logs (user_id, created_at DESC);
CREATE INDEX idx_usage_action_type  ON public.usage_logs (action_type);
CREATE INDEX idx_usage_user_month   ON public.usage_logs (user_id, date_trunc('month', created_at));
CREATE INDEX idx_usage_reference    ON public.usage_logs (reference_id) WHERE reference_id IS NOT NULL;

-- RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_owner_select"
  ON public.usage_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only service role inserts (server actions, never client)
CREATE POLICY "usage_service_all"
  ON public.usage_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE  public.usage_logs             IS 'Immutable AI generation audit log — no content, stats only';
COMMENT ON COLUMN public.usage_logs.reference_id IS 'FK to the generated item (proposal/reply/estimate)';


-- ============================================================
-- 7. USER PREFERENCES
-- Personal settings per user (1-to-1 with profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  -- Same PK as auth.users — guaranteed 1 row per user
  id                      UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id                 UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Writing personality
  tone                    TEXT    NOT NULL DEFAULT 'professional'
                          CHECK (tone IN ('professional','casual','confident','friendly')),
  writing_style           TEXT,           -- free-text: "direct, no fluff, technical"
  bio_summary             TEXT,           -- what user says about themselves to clients

  -- Business info
  hourly_rate             INT,            -- in USD
  currency                TEXT    NOT NULL DEFAULT 'USD',
  skills                  TEXT[]  DEFAULT '{}',
  experience_years        SMALLINT,
  portfolio_url           TEXT,

  -- AI generation defaults
  default_proposal_style  TEXT    NOT NULL DEFAULT 'concise'
                          CHECK (default_proposal_style IN ('concise','technical','premium','agency')),
  default_platform        TEXT    NOT NULL DEFAULT 'upwork'
                          CHECK (default_platform IN ('upwork','freelancer','toptal','direct','other')),

  -- Notifications
  email_on_followup       BOOLEAN NOT NULL DEFAULT true,
  email_on_tips           BOOLEAN NOT NULL DEFAULT true,
  browser_notifications   BOOLEAN NOT NULL DEFAULT false,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_prefs_user_unique UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_prefs_user_id ON public.user_preferences (user_id);
CREATE INDEX idx_prefs_skills  ON public.user_preferences USING GIN (skills);

-- updated_at trigger
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefs_owner_all"
  ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prefs_service_all"
  ON public.user_preferences FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Auto-create preferences row on signup
CREATE OR REPLACE FUNCTION public.handle_new_preferences()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_preferences (id, user_id)
  VALUES (NEW.id, NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_user_preferences_init
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_preferences();

COMMENT ON TABLE  public.user_preferences                   IS '1-to-1 with profiles — personal AI + notification settings';
COMMENT ON COLUMN public.user_preferences.writing_style     IS 'Free text describing user tone for AI personalization';
COMMENT ON COLUMN public.user_preferences.hourly_rate       IS 'Used by estimator to auto-calculate project pricing';


-- ============================================================
-- ANALYTICS VIEWS (no PII)
-- ============================================================

-- Monthly usage per user (for billing limits)
CREATE OR REPLACE VIEW public.monthly_usage AS
SELECT
  user_id,
  date_trunc('month', created_at)               AS month,
  COUNT(*) FILTER (WHERE action_type = 'proposal_generated')  AS proposals_count,
  COUNT(*) FILTER (WHERE action_type = 'reply_generated')     AS replies_count,
  COUNT(*) FILTER (WHERE action_type = 'estimate_generated')  AS estimates_count,
  SUM(tokens_input + COALESCE(tokens_output, 0))              AS total_tokens
FROM public.usage_logs
GROUP BY user_id, date_trunc('month', created_at);

-- Proposal win-rate per user
CREATE OR REPLACE VIEW public.proposal_stats AS
SELECT
  user_id,
  COUNT(*)                                            AS total_proposals,
  COUNT(*) FILTER (WHERE status = 'won')              AS won,
  COUNT(*) FILTER (WHERE status = 'lost')             AS lost,
  COUNT(*) FILTER (WHERE status = 'replied')          AS replied,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'won')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status IN ('won','lost')), 0) * 100, 1
  )                                                   AS win_rate_pct,
  AVG(ai_score)                                       AS avg_ai_score
FROM public.proposals
GROUP BY user_id;
