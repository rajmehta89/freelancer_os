/**
 * OpenAI Client — src/lib/openai/client.ts
 * Lazy singleton — only instantiated on first use, not at build time.
 *
 * Security:
 * - OPENAI_API_KEY is server-only (no NEXT_PUBLIC_ prefix)
 * - Never import this in client components
 * - Never log the key or any prompt/response content
 */

import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_key") {
    throw new Error(
      "[openai/client.ts] OPENAI_API_KEY is not configured. " +
        "Add it to .env.local → OPENAI_API_KEY=sk-..."
    );
  }

  _client = new OpenAI({ apiKey });
  return _client;
}
