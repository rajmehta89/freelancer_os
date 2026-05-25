/**
 * POST /api/generate/reply
 * Streams an AI-generated client reply.
 *
 * Security:
 * - Auth check required
 * - Rate limit: free plan = 3 replies/month
 * - Never log message content
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";
import { supabaseAdmin }             from "@/lib/supabase/admin";
import { getOpenAI }                 from "@/lib/openai/client";
import { buildReplyMessages }        from "@/lib/openai/prompts/reply";
import { replyGenerateSchema }       from "@/lib/validations";
import { log }                       from "@/lib/logger";
import type { ReplyType }            from "@/types";

const FILE       = "api/generate/reply";
const MODEL      = "gpt-4o-mini";
const FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  // ── Auth ───────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Validate ───────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = replyGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { clientMessage, replyType, context } = parsed.data;

  // ── Rate Limit ─────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, replies_used")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "free" && (profile.replies_used ?? 0) >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "Monthly limit reached. Upgrade to Pro for unlimited replies." },
      { status: 429 }
    );
  }

  // ── Build Prompt ───────────────────────────────────────────
  const messages = buildReplyMessages({
    clientMessage,
    replyType: replyType as ReplyType,
    context:   context ?? undefined,
  });

  // ── Init OpenAI — fail fast before stream starts ───────────
  let openai: ReturnType<typeof getOpenAI>;
  try {
    openai = getOpenAI();
  } catch (err) {
    log.error(FILE, "OpenAI not configured", err);
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy." },
      { status: 500 }
    );
  }

  log.info(FILE, "Starting reply stream", { replyType });

  let fullText     = "";
  let tokensInput  = 0;
  let tokensOutput = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model:          MODEL,
          messages,
          stream:         true,
          stream_options: { include_usage: true },
          max_tokens:     400,
          temperature:    0.68,
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

        // ── Close stream immediately — user gets text now ─────
        controller.close();

        // ── DB writes: fire-and-forget, non-fatal ─────────────
        const generationMs = Date.now() - startMs;

        let savedId: string | null = null;
        try {
          const { data: saved } = await supabase
            .from("client_replies")
            .insert({
              user_id:         user.id,
              client_message:  clientMessage,
              reply_type:      replyType,
              context:         context ?? null,
              generated_reply: fullText,
              model:           MODEL,
              tokens_input:    tokensInput  || null,
              tokens_output:   tokensOutput || null,
              generation_ms:   generationMs,
            })
            .select("id")
            .single();
          savedId = saved?.id ?? null;
        } catch (e) {
          log.error(FILE, "Reply save failed (non-fatal)", e);
        }

        // Usage log — non-fatal
        if (savedId) {
          supabaseAdmin.from("usage_logs").insert({
            user_id:        user.id,
            action_type:    "reply_generated",
            model:          MODEL,
            tokens_input:   tokensInput  || null,
            tokens_output:  tokensOutput || null,
            latency_ms:     generationMs,
            reference_id:   savedId,
            reference_type: "client_replies",
          }).then(null, (e) => log.warn(FILE, "Usage log failed (non-fatal)", e));
        }

        // Counter increment — non-fatal
        supabase
          .from("profiles")
          .update({ replies_used: (profile?.replies_used ?? 0) + 1 })
          .eq("id", user.id)
          .then(null, (e) => log.warn(FILE, "Counter increment failed (non-fatal)", e));

        log.ai(FILE, "Reply complete", {
          model:            MODEL,
          promptTokens:     tokensInput,
          completionTokens: tokensOutput,
          ms:               generationMs,
        });

      } catch (err) {
        log.error(FILE, "Reply stream error", err);
        try { controller.error(err); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/plain; charset=utf-8",
      "Cache-Control":     "no-cache, no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
