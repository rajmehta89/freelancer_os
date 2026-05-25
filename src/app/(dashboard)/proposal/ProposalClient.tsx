"use client";

/**
 * ProposalClient — interactive proposal generator UI.
 * Streams output from /api/generate/proposal using fetch + ReadableStream.
 */

import { useState, useRef } from "react";
import Link                  from "next/link";
import { Button }            from "@/components/ui/button";
import { cn }                from "@/lib/utils";
import {
  Sparkles, Copy, RefreshCw, Check, AlertCircle,
  Zap, Wrench, Crown, Building2, ChevronDown,
} from "lucide-react";
import type { ProposalStyle, Platform } from "@/types";

// ── Style options ────────────────────────────────────────────
const STYLES: Array<{
  id:    ProposalStyle;
  label: string;
  icon:  React.ReactNode;
  desc:  string;
  words: string;
}> = [
  { id: "concise",   label: "Concise",   icon: <Zap       className="h-4 w-4" />, desc: "Short & punchy",       words: "150–200 words" },
  { id: "technical", label: "Technical", icon: <Wrench    className="h-4 w-4" />, desc: "Deep tech approach",   words: "300–400 words" },
  { id: "premium",   label: "Premium",   icon: <Crown     className="h-4 w-4" />, desc: "High-value tone",      words: "250–350 words" },
  { id: "agency",    label: "Agency",    icon: <Building2 className="h-4 w-4" />, desc: "Pro agency voice",     words: "300–450 words" },
];

const PLATFORMS: Array<{ id: Platform; label: string }> = [
  { id: "upwork",     label: "Upwork"         },
  { id: "freelancer", label: "Freelancer.com"  },
  { id: "toptal",     label: "Toptal"          },
  { id: "direct",     label: "Direct Client"   },
  { id: "other",      label: "Other"           },
];

// ── Props ────────────────────────────────────────────────────
interface ProposalClientProps {
  plan:            "free" | "pro" | "agency";
  proposalsUsed:   number;
  defaultStyle?:   ProposalStyle;
  defaultPlatform?: Platform;
}

type GenState = "idle" | "loading" | "complete" | "error";

// ── Component ────────────────────────────────────────────────
export function ProposalClient({
  plan,
  proposalsUsed,
  defaultStyle   = "concise",
  defaultPlatform = "upwork",
}: ProposalClientProps) {
  const [jobPost,      setJobPost]      = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [style,        setStyle]        = useState<ProposalStyle>(defaultStyle);
  const [platform,     setPlatform]     = useState<Platform>(defaultPlatform);
  const [output,       setOutput]       = useState("");
  const [genState,     setGenState]     = useState<GenState>("idle");
  const [error,        setError]        = useState("");
  const [copied,       setCopied]       = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const FREE_LIMIT  = 5;
  const isAtLimit   = plan === "free" && proposalsUsed >= FREE_LIMIT;
  const isLoading   = genState === "loading";
  const hasOutput   = output.length > 0;
  const wordCount   = output.split(/\s+/).filter(Boolean).length;

  // ── Generate ─────────────────────────────────────────────
  async function generate() {
    if (!jobPost.trim() || isLoading || isAtLimit) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setGenState("loading");
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/generate/proposal", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ jobPost, style, platform, extraContext }),
        signal:  abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error((data as { error?: string }).error ?? "Generation failed");
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setGenState("complete");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setGenState("error");
    }
  }

  async function copyText() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Limit banner ───────────────────────────────── */}
      {isAtLimit && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-400">
            You&apos;ve used all {FREE_LIMIT} free proposals this month.
          </p>
          <Link href="/billing">
            <Button size="sm" variant="secondary">Upgrade to Pro</Button>
          </Link>
        </div>
      )}

      {/* ── Input card ─────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-6 space-y-5">

        {/* Job post */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Job Post <span className="text-red-400">*</span>
          </label>
          <textarea
            value={jobPost}
            onChange={(e) => setJobPost(e.target.value)}
            placeholder="Paste the full job posting here — include the description, requirements, and any budget info..."
            rows={8}
            disabled={isLoading}
            maxLength={5000}
            className={cn(
              "w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 resize-none",
              "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed border-white/8 hover:border-white/15"
            )}
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{jobPost.length < 30 && jobPost.length > 0 ? "⚠ At least 30 characters needed" : ""}</span>
            <span>{jobPost.length} / 5000</span>
          </div>
        </div>

        {/* Style selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Proposal Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-150",
                  style === s.id
                    ? "border-indigo-500/60 bg-indigo-600/15 ring-1 ring-indigo-500/30"
                    : "border-white/5 bg-gray-950/30 hover:border-white/10"
                )}
              >
                <span className={cn(
                  "flex items-center gap-1.5 text-sm font-semibold",
                  style === s.id ? "text-indigo-300" : "text-gray-300"
                )}>
                  {s.icon} {s.label}
                </span>
                <span className="text-xs text-gray-600">{s.words}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform + Extra context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Platform</label>
            <div className="relative">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                disabled={isLoading}
                className="w-full appearance-none rounded-xl border border-white/8 bg-gray-950/60 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Your Context{" "}
              <span className="text-gray-600 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Relevant skills, tech stack, past wins..."
              rows={3}
              disabled={isLoading}
              maxLength={1000}
              className={cn(
                "w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 resize-none",
                "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 border-white/8 hover:border-white/15",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {plan === "free" && (
            <span className={cn(
              "text-xs tabular-nums",
              proposalsUsed >= FREE_LIMIT ? "text-red-400" : "text-gray-500"
            )}>
              {proposalsUsed} / {FREE_LIMIT} proposals used this month
            </span>
          )}
          <Button
            onClick={generate}
            disabled={!jobPost.trim() || jobPost.length < 30 || isLoading || isAtLimit}
            size="lg"
            className={cn("ml-auto shrink-0", isLoading && "opacity-80")}
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? "Generating…" : "Generate Proposal"}
          </Button>
        </div>
      </div>

      {/* ── Output card ────────────────────────────────── */}
      {(hasOutput || isLoading) && (
        <div className="rounded-2xl border border-white/5 bg-gray-900/40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Generated Proposal</span>
              {genState === "complete" && (
                <span className="text-xs text-gray-500 tabular-nums">{wordCount} words</span>
              )}
              {isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Writing…
                </span>
              )}
            </div>

            {genState === "complete" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyText}>
                  {copied
                    ? <><Check className="h-3.5 w-3.5 text-green-400" /> Copied!</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy</>
                  }
                </Button>
                <Button variant="ghost" size="sm" onClick={generate}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {output}
              {isLoading && (
                <span className="inline-block w-0.5 h-[1.1em] bg-indigo-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </p>
          </div>

          {/* Copy bottom bar (convenience on long proposals) */}
          {genState === "complete" && wordCount > 80 && (
            <div className="px-6 py-3 border-t border-white/5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={copyText}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Proposal"}
              </Button>
              <Button variant="ghost" size="sm" onClick={generate}>
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────── */}
      {genState === "error" && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Generation failed</p>
            <p className="text-xs mt-0.5 text-red-400/80">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
