/**
 * POST /api/generate/proposal
 * Generates an AI proposal and returns it as JSON.
 *
 * Non-streaming: more reliable on Vercel hobby (10s limit).
 * Every step is logged so Vercel function logs show exactly where failures occur.
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

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startMs = Date.now();
  console.log(`[${FILE}] ── POST /api/generate/proposal started ──`);

  try {

    // ── STEP 1: Auth ─────────────────────────────────────────
    console.log(`[${FILE}] step 1: createClient`);
    const supabase = await createClient();

    console.log(`[${FILE}] step 2: getUser`);
    const authResult = await supabase.auth.getUser();
    const user       = authResult.data?.user;
    const authError  = authResult.error;

    if (authError) {
      console.error(`[${FILE}] auth error:`, authError.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user) {
      console.error(`[${FILE}] no user in session`);
      return NextResponse.json({ error: "Unauthorized – please log in again." }, { status: 401 });
    }
    console.log(`[${FILE}] step 2 OK – userId: ${user.id.slice(0, 8)}***`);

    // ── STEP 2: Parse & Validate body ────────────────────────
    console.log(`[${FILE}] step 3: parse request body`);
    let body: unknown;
    try {
      body = await req.json();
    } catch (e) {
      console.error(`[${FILE}] JSON parse error:`, e);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = proposalGenerateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid input";
      console.error(`[${FILE}] validation error:`, msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { jobPost, style, platform, extraContext } = parsed.data;
    console.log(`[${FILE}] step 3 OK – style=${style} platform=${platform} jobLen=${jobPost.length}`);

    // ── STEP 3: Rate limit ───────────────────────────────────
    console.log(`[${FILE}] step 4: load profile for rate limit`);
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("plan, proposals_used")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      console.warn(`[${FILE}] profile query error (non-fatal):`, profileErr.message);
    }

    if (profile?.plan === "free" && (profile.proposals_used ?? 0) >= FREE_LIMIT) {
      log.warn(FILE, "Free plan limit reached", { userId: user.id.slice(0, 8) });
      return NextResponse.json(
        { error: "Monthly limit reached. Upgrade to Pro for unlimited proposals." },
        { status: 429 }
      );
    }
    console.log(`[${FILE}] step 4 OK – plan=${profile?.plan ?? "unknown"} used=${profile?.proposals_used ?? 0}`);

    // ── STEP 4: User preferences ─────────────────────────────
    console.log(`[${FILE}] step 5: load user preferences`);
    const { data: prefs, error: prefsErr } = await supabase
      .from("user_preferences")
      .select("bio_summary, skills, experience_years")
      .eq("user_id", user.id)
      .single();

    if (prefsErr) {
      console.warn(`[${FILE}] prefs query error (non-fatal):`, prefsErr.message);
    }
    console.log(`[${FILE}] step 5 OK – hasPrefs=${!!prefs}`);

    // ── STEP 5: Build prompt ─────────────────────────────────
    console.log(`[${FILE}] step 6: build prompt messages`);
    const messages = buildProposalMessages({
      jobPost,
      style:           style as ProposalStyle,
      platform:        platform as Platform,
      extraContext:    extraContext ?? undefined,
      userBio:         prefs?.bio_summary      ?? undefined,
      skills:          prefs?.skills           ?? [],
      experienceYears: prefs?.experience_years ?? undefined,
    });
    console.log(`[${FILE}] step 6 OK – messages=${messages.length}`);

    // ── STEP 6: Init OpenAI ──────────────────────────────────
    console.log(`[${FILE}] step 7: init OpenAI client`);
    let openai: ReturnType<typeof getOpenAI>;
    try {
      openai = getOpenAI();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${FILE}] OpenAI init FAILED:`, msg);
      log.error(FILE, "OpenAI init failed", err);
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Go to Vercel → Project → Settings → Environment Variables, add OPENAI_API_KEY=sk-..., then Redeploy." },
        { status: 500 }
      );
    }
    console.log(`[${FILE}] step 7 OK – OpenAI client ready`);

    // ── STEP 7: Call OpenAI (non-streaming) ──────────────────
    console.log(`[${FILE}] step 8: calling OpenAI ${MODEL}`);
    const aiStart = Date.now();

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model:       MODEL,
        messages,
        stream:      false,
        max_tokens:  600,
        temperature: 0.72,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${FILE}] OpenAI API call FAILED:`, msg);
      log.error(FILE, "OpenAI API call failed", err);
      return NextResponse.json(
        { error: `AI generation failed: ${msg}` },
        { status: 500 }
      );
    }

    const aiMs          = Date.now() - aiStart;
    const generatedText = completion.choices[0]?.message?.content ?? "";
    const tokensInput   = completion.usage?.prompt_tokens  ?? 0;
    const tokensOutput  = completion.usage?.completion_tokens ?? 0;
    const generationMs  = Date.now() - startMs;

    console.log(`[${FILE}] step 8 OK – aiMs=${aiMs} tokens=${tokensInput}/${tokensOutput} textLen=${generatedText.length}`);
    log.ai(FILE, "OpenAI proposal complete", {
      model:            MODEL,
      promptTokens:     tokensInput,
      completionTokens: tokensOutput,
      ms:               aiMs,
    });

    if (!generatedText.trim()) {
      console.error(`[${FILE}] OpenAI returned EMPTY content`);
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    // ── STEP 8: Persist to DB (non-fatal) ────────────────────
    console.log(`[${FILE}] step 9: saving proposal to DB`);
    let savedId: string | null = null;
    try {
      const { data: saved, error: saveErr } = await supabase
        .from("proposals")
        .insert({
          user_id:        user.id,
          job_post:       jobPost,
          generated_text: generatedText,
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

      if (saveErr) {
        console.warn(`[${FILE}] DB save error (non-fatal):`, saveErr.message);
      } else {
        savedId = saved?.id ?? null;
        console.log(`[${FILE}] step 9 OK – saved id=${savedId?.slice(0, 8)}`);
      }
    } catch (e) {
      console.warn(`[${FILE}] DB save threw (non-fatal):`, e);
    }

    // ── STEP 9: Usage log + counter (fire-and-forget) ────────
    if (savedId) {
      supabaseAdmin.from("usage_logs").insert({
        user_id:        user.id,
        action_type:    "proposal_generated",
        model:          MODEL,
        tokens_input:   tokensInput  || null,
        tokens_output:  tokensOutput || null,
        latency_ms:     generationMs,
        reference_id:   savedId,
        reference_type: "proposals",
      }).then(null, (e) => console.warn(`[${FILE}] usage log failed (non-fatal):`, e));
    }

    supabase
      .from("profiles")
      .update({ proposals_used: (profile?.proposals_used ?? 0) + 1 })
      .eq("id", user.id)
      .then(null, (e) => console.warn(`[${FILE}] counter increment failed (non-fatal):`, e));

    console.log(`[${FILE}] ── DONE – totalMs=${generationMs} ──`);

    // ── Return JSON ──────────────────────────────────────────
    return NextResponse.json({
      proposal:    generatedText,
      tokensUsed:  tokensInput + tokensOutput,
      generatedMs: generationMs,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? err.stack   : undefined;
    console.error(`[${FILE}] !! UNHANDLED EXCEPTION !!`, message, stack);
    log.error(FILE, "Unhandled route exception", err);
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
