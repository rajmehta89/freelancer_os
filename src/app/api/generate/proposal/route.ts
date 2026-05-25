/**
 * POST /api/generate/proposal
 * Streams an AI-generated proposal to the client.
 *
 * Flow:
 * 1. Auth check (Supabase session cookie)
 * 2. Rate limit check (free plan: 5 proposals/month)
 * 3. Validate input with Zod
 * 4. Fetch user preferences for personalisation
 * 5. Stream OpenAI response
 * 6. After stream: save to DB + log usage + increment counter
 *
 * Security:
 * - Never log job post content or generated text
 * - Never expose OpenAI key to client
 * - RLS enforced at DB level
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";
import { supabaseAdmin }             from "@/lib/supabase/admin";
import { getOpenAI }                 from "@/lib/openai/client";
import { buildProposalMessages }     from "@/lib/openai/prompts/proposal";
import { proposalGenerateSchema }    from "@/lib/validations";
import { log }                       from "@/lib/logger";
import type { ProposalStyle, Platform } from "@/types";

const FILE       = "api/generate/proposal";
const MODEL      = "gpt-4o-mini";
const FREE_LIMIT = 5;

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  // ── 1. Auth ────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse & Validate ────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = proposalGenerateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { jobPost, style, platform, extraContext } = parsed.data;

  // ── 3. Rate Limit (free plan) ───────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, proposals_used")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "free" && (profile.proposals_used ?? 0) >= FREE_LIMIT) {
    log.warn(FILE, "Free plan limit reached", { userId: user.id.slice(0, 8) });
    return NextResponse.json(
      { error: "Monthly proposal limit reached. Upgrade to Pro for unlimited proposals." },
      { status: 429 }
    );
  }

  // ── 4. Load User Preferences for Personalisation ───────────
  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("bio_summary, skills, experience_years")
    .eq("user_id", user.id)
    .single();

  // ── 5. Build prompt ────────────────────────────────────────
  const messages = buildProposalMessages({
    jobPost,
    style:           style as ProposalStyle,
    platform:        platform as Platform,
    extraContext:    extraContext ?? undefined,
    userBio:         prefs?.bio_summary  ?? undefined,
    skills:          prefs?.skills       ?? [],
    experienceYears: prefs?.experience_years ?? undefined,
  });

  log.info(FILE, "Starting proposal stream", { style, platform });

  // ── 6. Stream OpenAI → Client ──────────────────────────────
  let fullText     = "";
  let tokensInput  = 0;
  let tokensOutput = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openai     = getOpenAI();
        const completion = await openai.chat.completions.create({
          model:        MODEL,
          messages,
          stream:       true,
          stream_options: { include_usage: true },
          max_tokens:   900,
          temperature:  0.72,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            controller.enqueue(new TextEncoder().encode(delta));
          }
          if (chunk.usage) {
            tokensInput  = chunk.usage.prompt_tokens;
            tokensOutput = chunk.usage.completion_tokens;
          }
        }

        // ── 7. Save to DB after stream completes ──────────────
        const generationMs = Date.now() - startMs;

        const { data: saved } = await supabase
          .from("proposals")
          .insert({
            user_id:        user.id,
            job_post:       jobPost,
            generated_text: fullText,
            style,
            platform,
            model:          MODEL,
            tokens_input:   tokensInput  || null,
            tokens_output:  tokensOutput || null,
            generation_ms:  generationMs,
            status:         "draft",
          })
          .select("id")
          .single();

        // ── 8. Log usage (service role only) ──────────────────
        if (saved?.id) {
          await supabaseAdmin.from("usage_logs").insert({
            user_id:        user.id,
            action_type:    "proposal_generated",
            model:          MODEL,
            tokens_input:   tokensInput  || null,
            tokens_output:  tokensOutput || null,
            latency_ms:     generationMs,
            reference_id:   saved.id,
            reference_type: "proposals",
          });
        }

        // ── 9. Increment proposals_used counter ────────────────
        await supabase
          .from("profiles")
          .update({ proposals_used: (profile?.proposals_used ?? 0) + 1 })
          .eq("id", user.id);

        log.ai(FILE, "Proposal stream complete", {
          model:             MODEL,
          promptTokens:      tokensInput,
          completionTokens:  tokensOutput,
          ms:                generationMs,
        });

        controller.close();
      } catch (err) {
        log.error(FILE, "OpenAI stream failed", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":     "text/plain; charset=utf-8",
      "Cache-Control":    "no-cache, no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
