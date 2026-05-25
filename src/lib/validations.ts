import { z } from "zod";

// ── Waitlist ────────────────────────────────────────────────
export const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  painPoints: z.array(z.string()).min(1, "Please select at least one challenge").max(6),
  role: z.enum(["freelancer", "agency", "both"]).optional(),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

// ── Auth ────────────────────────────────────────────────────
const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254);

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: emailField,
  password: passwordField,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ── Proposal Generation ─────────────────────────────────────
export const proposalGenerateSchema = z.object({
  jobPost: z
    .string()
    .min(30, "Job post must be at least 30 characters — paste the full job description")
    .max(5000, "Job post is too long (max 5000 characters)"),
  style: z
    .enum(["concise", "technical", "premium", "agency"])
    .default("concise"),
  platform: z
    .enum(["upwork", "freelancer", "toptal", "direct", "other"])
    .default("upwork"),
  extraContext: z.string().max(1000).optional(),
});
export type ProposalGenerateInput = z.infer<typeof proposalGenerateSchema>;

// ── Reply Generation ────────────────────────────────────────
export const replyGenerateSchema = z.object({
  clientMessage: z
    .string()
    .min(10, "Please paste the client's message")
    .max(3000, "Message is too long"),
  replyType: z.enum(["lowball", "followup", "negotiation", "delay", "upsell", "general"]),
  context: z.string().max(500).optional(),
});
export type ReplyGenerateInput = z.infer<typeof replyGenerateSchema>;

// ── Settings ─────────────────────────────────────────────────
export const settingsSchema = z.object({
  // Profile
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  // Preferences
  tone: z.enum(["professional", "casual", "confident", "friendly"]),
  writingStyle: z.string().max(200).optional().default(""),
  bioSummary: z.string().max(500).optional().default(""),
  hourlyRate: z.coerce.number().min(0).max(10000).optional(),
  skills: z.string().max(500).optional().default(""),
  experienceYears: z.coerce.number().min(0).max(60).optional(),
  portfolioUrl: z.string().max(300).optional().default(""),
  defaultProposalStyle: z.enum(["concise", "technical", "premium", "agency"]),
  defaultPlatform: z.enum(["upwork", "freelancer", "toptal", "direct", "other"]),
  emailOnFollowup: z.boolean().default(true),
  emailOnTips: z.boolean().default(true),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
