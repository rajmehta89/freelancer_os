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
