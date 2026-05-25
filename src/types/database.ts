/**
 * Database Types — src/types/database.ts
 * TypeScript interfaces for every Supabase table.
 * Mirrors supabase/migrations/001–003 exactly.
 *
 * Naming convention:
 *   Row    — shape of a SELECT result
 *   Insert — shape for INSERT (omits auto-generated fields)
 *   Update — shape for UPDATE (all fields optional except id)
 */

// ── Utility helpers ──────────────────────────────────────────
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json }
  | Json[];

// ── PROFILES ────────────────────────────────────────────────
export interface ProfileRow {
  id:              string;
  email:           string;
  full_name:       string | null;
  avatar_url:      string | null;
  plan:            "free" | "pro" | "agency";
  proposals_used:  number;
  replies_used:    number;
  onboarded:       boolean;
  created_at:      string;
  updated_at:      string;
}
export interface ProfileInsert extends Omit<ProfileRow, "proposals_used" | "replies_used" | "onboarded" | "created_at" | "updated_at"> {}
export interface ProfileUpdate extends Partial<Omit<ProfileRow, "id" | "created_at">> {}

// ── PROPOSALS ───────────────────────────────────────────────
export type ProposalStyle    = "concise" | "technical" | "premium" | "agency";
export type ProposalStatus   = "draft" | "sent" | "replied" | "won" | "lost" | "archived";
export type ProposalPlatform = "upwork" | "freelancer" | "toptal" | "direct" | "other";

export interface ProposalRow {
  id:              string;
  user_id:         string;
  job_post:        string;
  client_name:     string | null;
  job_url:         string | null;
  platform:        ProposalPlatform;
  title:           string | null;
  generated_text:  string;
  style:           ProposalStyle;
  model:           string | null;
  tokens_input:    number | null;
  tokens_output:   number | null;
  generation_ms:   number | null;
  ai_score:        number | null;
  status:          ProposalStatus;
  sent_at:         string | null;
  won_at:          string | null;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
}
export interface ProposalInsert {
  user_id:         string;
  job_post:        string;
  generated_text:  string;
  style:           ProposalStyle;
  client_name?:    string;
  job_url?:        string;
  platform?:       ProposalPlatform;
  title?:          string;
  model?:          string;
  tokens_input?:   number;
  tokens_output?:  number;
  generation_ms?:  number;
  ai_score?:       number;
  status?:         ProposalStatus;
  notes?:          string;
}
export interface ProposalUpdate extends Partial<Omit<ProposalRow, "id" | "user_id" | "created_at">> {}

// ── CLIENT REPLIES ───────────────────────────────────────────
export type ReplyType =
  | "lowball" | "followup" | "negotiation"
  | "delay"   | "upsell"   | "general";

export interface ClientReplyRow {
  id:               string;
  user_id:          string;
  proposal_id:      string | null;
  client_message:   string;
  reply_type:       ReplyType;
  context:          string | null;
  generated_reply:  string;
  model:            string | null;
  tokens_input:     number | null;
  tokens_output:    number | null;
  generation_ms:    number | null;
  created_at:       string;
  updated_at:       string;
}
export interface ClientReplyInsert {
  user_id:          string;
  client_message:   string;
  reply_type:       ReplyType;
  generated_reply:  string;
  proposal_id?:     string;
  context?:         string;
  model?:           string;
  tokens_input?:    number;
  tokens_output?:   number;
  generation_ms?:   number;
}
export interface ClientReplyUpdate extends Partial<Omit<ClientReplyRow, "id" | "user_id" | "created_at">> {}

// ── PROJECT ESTIMATES ────────────────────────────────────────
export type ProjectComplexity = "simple" | "medium" | "complex" | "enterprise";

export interface MilestoneItem {
  title:       string;
  days:        number;
  price:       number;
  description: string;
}
export interface RiskItem {
  title:       string;
  mitigation:  string;
}

export interface ProjectEstimateRow {
  id:                    string;
  user_id:               string;
  proposal_id:           string | null;
  project_description:   string;
  requirements:          string | null;
  tech_stack:            string[];
  timeline_days:         number | null;
  min_price:             number | null;
  max_price:             number | null;
  currency:              string;
  complexity:            ProjectComplexity | null;
  milestones:            MilestoneItem[];
  risks:                 RiskItem[];
  tech_recommendations:  string | null;
  model:                 string | null;
  tokens_input:          number | null;
  tokens_output:         number | null;
  generation_ms:         number | null;
  created_at:            string;
  updated_at:            string;
}
export interface ProjectEstimateInsert {
  user_id:                  string;
  project_description:      string;
  timeline_days?:           number;
  min_price?:               number;
  max_price?:               number;
  currency?:                string;
  complexity?:              ProjectComplexity;
  milestones?:              MilestoneItem[];
  risks?:                   RiskItem[];
  proposal_id?:             string;
  requirements?:            string;
  tech_stack?:              string[];
  tech_recommendations?:    string;
  model?:                   string;
  tokens_input?:            number;
  tokens_output?:           number;
  generation_ms?:           number;
}
export interface ProjectEstimateUpdate extends Partial<Omit<ProjectEstimateRow, "id" | "user_id" | "created_at">> {}

// ── TEMPLATES ───────────────────────────────────────────────
export type TemplateType = "proposal" | "reply" | "estimate";

export interface TemplateRow {
  id:           string;
  user_id:      string;
  title:        string;
  type:         TemplateType;
  content:      string;
  tags:         string[];
  is_default:   boolean;
  is_public:    boolean;
  usage_count:  number;
  created_at:   string;
  updated_at:   string;
}
export interface TemplateInsert {
  user_id:      string;
  title:        string;
  type:         TemplateType;
  content:      string;
  tags?:        string[];
  is_default?:  boolean;
  is_public?:   boolean;
}
export interface TemplateUpdate extends Partial<Omit<TemplateRow, "id" | "user_id" | "created_at">> {}

// ── SUBSCRIPTIONS ────────────────────────────────────────────
export type SubscriptionPlan   = "free" | "pro" | "agency";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due" | "trialing";

export interface SubscriptionRow {
  id:                       string;
  user_id:                  string;
  razorpay_subscription_id: string | null;
  razorpay_customer_id:     string | null;
  razorpay_plan_id:         string | null;
  plan:                     SubscriptionPlan;
  status:                   SubscriptionStatus;
  current_period_start:     string | null;
  current_period_end:       string | null;
  cancel_at_period_end:     boolean;
  cancelled_at:             string | null;
  amount:                   number | null;
  currency:                 string;
  created_at:               string;
  updated_at:               string;
}

// ── USAGE LOGS ───────────────────────────────────────────────
export type UsageActionType =
  | "proposal_generated"
  | "reply_generated"
  | "estimate_generated"
  | "template_saved";

export interface UsageLogRow {
  id:             string;
  user_id:        string;
  action_type:    UsageActionType;
  model:          string | null;
  tokens_input:   number | null;
  tokens_output:  number | null;
  latency_ms:     number | null;
  reference_id:   string | null;
  reference_type: string | null;
  created_at:     string;
}
export interface UsageLogInsert {
  user_id:         string;
  action_type:     UsageActionType;
  model?:          string;
  tokens_input?:   number;
  tokens_output?:  number;
  latency_ms?:     number;
  reference_id?:   string;
  reference_type?: string;
}

// ── USER PREFERENCES ─────────────────────────────────────────
export type UserTone = "professional" | "casual" | "confident" | "friendly";

export interface UserPreferencesRow {
  id:                     string;
  user_id:                string;
  tone:                   UserTone;
  writing_style:          string | null;
  bio_summary:            string | null;
  hourly_rate:            number | null;
  currency:               string;
  skills:                 string[];
  experience_years:       number | null;
  portfolio_url:          string | null;
  default_proposal_style: ProposalStyle;
  default_platform:       ProposalPlatform;
  email_on_followup:      boolean;
  email_on_tips:          boolean;
  browser_notifications:  boolean;
  created_at:             string;
  updated_at:             string;
}
export interface UserPreferencesUpdate extends Partial<Omit<UserPreferencesRow, "id" | "user_id" | "created_at">> {}

// ── WAITLIST ─────────────────────────────────────────────────
export interface WaitlistRow {
  id:           string;
  email:        string;
  pain_points:  string[];
  role:         "freelancer" | "agency" | "both" | null;
  source:       string | null;
  ip_hash:      string | null;
  created_at:   string;
}

// ── DATABASE SCHEMA TYPE (for typed Supabase client) ─────────
export interface Database {
  public: {
    Tables: {
      profiles:           { Row: ProfileRow;          Insert: ProfileInsert;          Update: ProfileUpdate         };
      proposals:          { Row: ProposalRow;         Insert: ProposalInsert;         Update: ProposalUpdate        };
      client_replies:     { Row: ClientReplyRow;      Insert: ClientReplyInsert;      Update: ClientReplyUpdate     };
      project_estimates:  { Row: ProjectEstimateRow;  Insert: ProjectEstimateInsert;  Update: ProjectEstimateUpdate };
      templates:          { Row: TemplateRow;         Insert: TemplateInsert;         Update: TemplateUpdate        };
      subscriptions:      { Row: SubscriptionRow;     Insert: never;                  Update: never                 };
      usage_logs:         { Row: UsageLogRow;         Insert: UsageLogInsert;         Update: never                 };
      user_preferences:   { Row: UserPreferencesRow;  Insert: never;                  Update: UserPreferencesUpdate };
      waitlist:           { Row: WaitlistRow;         Insert: never;                  Update: never                 };
    };
    Views: {
      monthly_usage:   { Row: { user_id: string; month: string; proposals_count: number; replies_count: number; estimates_count: number; total_tokens: number } };
      proposal_stats:  { Row: { user_id: string; total_proposals: number; won: number; lost: number; replied: number; win_rate_pct: number; avg_ai_score: number } };
    };
  };
}
