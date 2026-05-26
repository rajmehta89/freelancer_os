/**
 * OpenAI Client — src/lib/openai/client.ts
 * Lazy singleton — only instantiated on first use, not at build time.
 *
 * Security:
 * - OPENAI_API_KEY is server-only (no NEXT_PUBLIC_ prefix)
 * - Never import this in client components
 * - Never log the key or any prompt/response content
 *
 * Required env var: OPENAI_API_KEY (set in Vercel → Project → Settings → Environment Variables)
 * Key must start with "sk-" — NOT "sk_live" (that is a Stripe key)
 */

import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;

  // Missing or placeholder
  if (!apiKey || apiKey === "your_openai_key" || apiKey.trim() === "") {
    throw new Error(
      "OPENAI_API_KEY is not set. " +
      "Go to platform.openai.com/api-keys → create key → " +
      "paste it in Vercel → Project → Settings → Environment Variables → Redeploy."
    );
  }

  // Wrong key pasted (e.g. Stripe sk_live_... or Razorpay rzp_live_...)
  if (!apiKey.startsWith("sk-")) {
    throw new Error(
      `OPENAI_API_KEY looks wrong — it starts with "${apiKey.slice(0, 10)}..." ` +
      "but OpenAI keys always start with \"sk-\". " +
      "You may have pasted the wrong key (e.g. a Stripe or Razorpay key). " +
      "Get your real key at platform.openai.com/api-keys."
    );
  }

  _client = new OpenAI({ apiKey });
  return _client;
}
