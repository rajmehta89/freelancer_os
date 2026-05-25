"use client";

/**
 * ReplyClient — AI-powered client reply generator.
 * Streams output from /api/generate/reply.
 */

import { useState, useRef } from "react";
import Link                  from "next/link";
import { Button }            from "@/components/ui/button";
import { cn }                from "@/lib/utils";
import {
  Sparkles, Copy, RefreshCw, Check,
  AlertCircle, ChevronDown,
} from "lucide-react";
import type { ReplyType } from "@/types";

// ── Reply type options ────────────────────────────────────────
const REPLY_TYPES: Array<{
  id:    ReplyType;
  label: string;
  desc:  string;
  emoji: string;
}> = [
  { id: "lowball",     label: "Lowball Offer",    desc: "Client offered below your rate",    emoji: "💰" },
  { id: "followup",    label: "Follow-Up",         desc: "No response in 3+ days",            emoji: "📬" },
  { id: "negotiation", label: "Negotiation",       desc: "Scope or price push-back",          emoji: "🤝" },
  { id: "delay",       label: "Project Delay",     desc: "Client keeps pushing start date",   emoji: "⏳" },
  { id: "upsell",      label: "Upsell",            desc: "Offer additional services",         emoji: "🚀" },
  { id: "general",     label: "General Reply",     desc: "Any other client message",          emoji: "💬" },
];

interface ReplyClientProps {
  plan:       "free" | "pro" | "agency";
  repliesUsed: number;
}

type GenState = "idle" | "loading" | "complete" | "error";

export function ReplyClient({ plan, repliesUsed }: ReplyClientProps) {
  const [replyType,      setReplyType]      = useState<ReplyType>("general");
  const [clientMessage,  setClientMessage]  = useState("");
  const [context,        setContext]        = useState("");
  const [output,         setOutput]         = useState("");
  const [genState,       setGenState]       = useState<GenState>("idle");
  const [error,          setError]          = useState("");
  const [copied,         setCopied]         = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const FREE_LIMIT = 3;
  const isAtLimit  = plan === "free" && repliesUsed >= FREE_LIMIT;
  const isLoading  = genState === "loading";
  const hasOutput  = output.length > 0;
  const wordCount  = output.split(/\s+/).filter(Boolean).length;

  async function generate() {
    if (!clientMessage.trim() || isLoading || isAtLimit) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setGenState("loading");
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/generate/reply", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clientMessage, replyType, context }),
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

  return (
    <div className="space-y-6">

      {/* Limit banner */}
      {isAtLimit && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-400">
            You&apos;ve used all {FREE_LIMIT} free replies this month.
          </p>
          <Link href="/billing">
            <Button size="sm" variant="secondary">Upgrade to Pro</Button>
          </Link>
        </div>
      )}

      {/* Input card */}
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-6 space-y-5">

        {/* Reply type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">What kind of reply?</label>

          {/* Desktop: grid; mobile: select */}
          <div className="hidden sm:grid grid-cols-3 gap-2">
            {REPLY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setReplyType(t.id)}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150",
                  replyType === t.id
                    ? "border-indigo-500/60 bg-indigo-600/15 ring-1 ring-indigo-500/30"
                    : "border-white/5 bg-gray-950/30 hover:border-white/10"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  replyType === t.id ? "text-indigo-300" : "text-gray-300"
                )}>
                  {t.emoji} {t.label}
                </span>
                <span className="text-xs text-gray-600">{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Mobile select */}
          <div className="sm:hidden relative">
            <select
              value={replyType}
              onChange={(e) => setReplyType(e.target.value as ReplyType)}
              disabled={isLoading}
              className="w-full appearance-none rounded-xl border border-white/8 bg-gray-950/60 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {REPLY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Client message */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Client&apos;s Message <span className="text-red-400">*</span>
          </label>
          <textarea
            value={clientMessage}
            onChange={(e) => setClientMessage(e.target.value)}
            placeholder="Paste what the client said..."
            rows={5}
            disabled={isLoading}
            maxLength={3000}
            className={cn(
              "w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 resize-none",
              "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 border-white/8 hover:border-white/15",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* Extra context */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Additional Context{" "}
            <span className="text-gray-600 font-normal text-xs">(optional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Your hourly rate, project details, what you've already agreed on..."
            rows={3}
            disabled={isLoading}
            maxLength={500}
            className={cn(
              "w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 resize-none",
              "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 border-white/8 hover:border-white/15",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {plan === "free" && (
            <span className={cn(
              "text-xs tabular-nums",
              repliesUsed >= FREE_LIMIT ? "text-red-400" : "text-gray-500"
            )}>
              {repliesUsed} / {FREE_LIMIT} replies used this month
            </span>
          )}
          <Button
            onClick={generate}
            disabled={!clientMessage.trim() || isLoading || isAtLimit}
            size="lg"
            className="ml-auto shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? "Writing Reply…" : "Generate Reply"}
          </Button>
        </div>
      </div>

      {/* Output */}
      {(hasOutput || isLoading) && (
        <div className="rounded-2xl border border-white/5 bg-gray-900/40 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Generated Reply</span>
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
                    : <><Copy  className="h-3.5 w-3.5" /> Copy</>
                  }
                </Button>
                <Button variant="ghost" size="sm" onClick={generate}>
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
              </div>
            )}
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {output}
              {isLoading && (
                <span className="inline-block w-0.5 h-[1.1em] bg-indigo-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
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
