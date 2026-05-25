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

const FILE        = "api/generate/reply";
const MODEL       = "gpt-4o-mini";
const FREE_LIMIT  = 3;

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
  try {
    body = await req.json();
  } catch {
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
      { error: "Monthly reply limit reached. Upgrade to Pro for unlimited replies." },
      { status: 429 }
    );
  }

  // ── Build Prompt ───────────────────────────────────────────
  const messages = buildReplyMessages({
    clientMessage,
    replyType: replyType as ReplyType,
    context:   context ?? undefined,
  });

  log.info(FILE, "Starting reply stream", { replyType });

  let fullText     = "";
  let tokensInput  = 0;
  let tokensOutput = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openai     = getOpenAI();
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

        const generationMs = Date.now() - startMs;

        // ── Save to DB ─────────────────────────────────────────
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

        // ── Log Usage ──────────────────────────────────────────
        if (saved?.id) {
          await supabaseAdmin.from("usage_logs").insert({
            user_id:        user.id,
            action_type:    "reply_generated",
            model:          MODEL,
            tokens_input:   tokensInput  || null,
            tokens_output:  tokensOutput || null,
            latency_ms:     generationMs,
            reference_id:   saved.id,
            reference_type: "client_replies",
          });
        }

        // ── Increment Counter ──────────────────────────────────
        await supabase
          .from("profiles")
          .update({ replies_used: (profile?.replies_used ?? 0) + 1 })
          .eq("id", user.id);

        log.ai(FILE, "Reply stream complete", {
          model:            MODEL,
          promptTokens:     tokensInput,
          completionTokens: tokensOutput,
          ms:               generationMs,
        });

        controller.close();
      } catch (err) {
        log.error(FILE, "Reply stream failed", err);
        controller.error(err);
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
