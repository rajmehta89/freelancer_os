import { z } from "zod";

export const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),

  painPoints: z
    .array(z.string())
    .min(1, "Please select at least one challenge")
    .max(6, "Maximum 6 selections"),

  role: z.enum(["freelancer", "agency", "both"]).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
