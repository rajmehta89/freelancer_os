/**
 * Reply Prompt Templates — src/lib/openai/prompts/reply.ts
 *
 * Builds prompts for AI-powered client reply generation.
 * Security: user content is passed as template params, never logged.
 */

import type { ReplyType } from "@/types";

const REPLY_TYPE_GUIDE: Record<ReplyType, string> = {
  lowball:
    "The client has offered a price below your rate. Respond professionally — acknowledge the offer, explain your value clearly, and either hold your rate or make a small, justified counter-offer. Never sound desperate or apologetic.",
  followup:
    "You sent a proposal or message and haven't heard back in 3+ days. Write a brief, confident follow-up. Not pushy, not desperate. Add a small value point or question to restart the conversation.",
  negotiation:
    "The client wants to reduce scope, change terms, or negotiate. Navigate diplomatically — find common ground while protecting your time and expertise. Offer scope adjustments with corresponding price adjustments.",
  delay:
    "The project start or client response keeps getting delayed. Professionally set expectations, confirm next steps, and keep momentum without appearing impatient.",
  upsell:
    "There's an opportunity to suggest additional services that would genuinely benefit the client. Frame it as adding value, not upselling. Connect it directly to their goals.",
  general:
    "A general professional reply to a client message. Be clear, concise, friendly, and action-oriented.",
};

export interface ReplyPromptParams {
  clientMessage: string;
  replyType: ReplyType;
  context?: string;
}

export function buildReplyMessages(
  params: ReplyPromptParams
): Array<{ role: "system" | "user"; content: string }> {
  const { clientMessage, replyType, context } = params;

  const system = `You are an expert freelance communication strategist. You help freelancers craft professional, strategic replies that protect their rates, maintain relationships, and move projects forward.

Your replies:
- Are confident but never aggressive or rude
- Are concise — 80 to 200 words maximum
- Always end with a clear next step or question
- Protect the freelancer's value without burning the bridge
- Sound human, not like a template

Output ONLY the reply text. No labels, explanations, or meta-commentary.`;

  const user = `Write a professional reply for this client situation.

REPLY TYPE: ${replyType.toUpperCase()}
${REPLY_TYPE_GUIDE[replyType]}

CLIENT MESSAGE:
${clientMessage}
${context ? `\nADDITIONAL CONTEXT:\n${context}` : ""}

Write a strategic, professional reply that handles this situation effectively. Keep it under 200 words:`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
