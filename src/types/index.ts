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
