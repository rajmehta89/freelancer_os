/** ── Waitlist ── */
export interface WaitlistEntry {
  id: string;
  email: string;
  pain_points: string[];
  role: "freelancer" | "agency" | "both" | null;
  source: string | null;
  created_at: string;
}

/** ── Server Action Result ── */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** ── Nav Link ── */
export interface NavLink {
  label: string;
  href: string;
}

/** ── Pricing Plan ── */
export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

// ─────────────────────────────────────────────────────────────────
// Domain Types
// ─────────────────────────────────────────────────────────────────

export type Plan = "free" | "pro" | "agency";
export type ProposalStyle = "concise" | "technical" | "premium" | "agency";
export type Platform = "upwork" | "freelancer" | "toptal" | "direct" | "other";
export type ProposalStatus = "draft" | "sent" | "replied" | "won" | "lost" | "archived";
export type ReplyType = "lowball" | "followup" | "negotiation" | "delay" | "upsell" | "general";
export type Tone = "professional" | "casual" | "confident" | "friendly";

/** ── User Profile (from public.profiles) ── */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  proposals_used: number;
  replies_used: number;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

/** ── User Preferences (from public.user_preferences) ── */
export interface UserPreferences {
  id: string;
  user_id: string;
  tone: Tone;
  writing_style: string | null;
  bio_summary: string | null;
  hourly_rate: number | null;
  currency: string;
  skills: string[];
  experience_years: number | null;
  portfolio_url: string | null;
  default_proposal_style: ProposalStyle;
  default_platform: Platform;
  email_on_followup: boolean;
  email_on_tips: boolean;
  browser_notifications: boolean;
  created_at: string;
  updated_at: string;
}

/** ── Proposal (from public.proposals) ── */
export interface Proposal {
  id: string;
  user_id: string;
  job_post: string;
  client_name: string | null;
  job_url: string | null;
  platform: Platform;
  title: string | null;
  generated_text: string;
  style: ProposalStyle;
  model: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  generation_ms: number | null;
  ai_score: number | null;
  status: ProposalStatus;
  sent_at: string | null;
  won_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** ── Client Reply (from public.client_replies) ── */
export interface ClientReply {
  id: string;
  user_id: string;
  proposal_id: string | null;
  client_message: string;
  reply_type: ReplyType;
  context: string | null;
  generated_reply: string;
  model: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  generation_ms: number | null;
  created_at: string;
  updated_at: string;
}
