/**
 * Proposal Prompt Templates — src/lib/openai/prompts/proposal.ts
 *
 * Builds the prompt sent to OpenAI for proposal generation.
 * Security: user content is injected into prompt templates, never logged.
 */

import type { ProposalStyle, Platform } from "@/types";

const STYLE_GUIDE: Record<ProposalStyle, string> = {
  concise:
    "Write 150–200 words maximum. Start with a one-sentence hook that directly addresses the client's problem. One proof point. End with a short, confident call-to-action. No filler words, no pleasantries.",
  technical:
    "Write 300–400 words. Open by naming the technical challenge and your specific approach to solving it. Mention relevant technologies, architecture decisions, and methodology. Show you have deeply analyzed the requirements. End with a clear next step.",
  premium:
    "Write 250–350 words. Position yourself as a high-value investment, not a cost center. Focus on ROI, business outcomes, and the cost of NOT solving this well. Confident, consultative tone — like a trusted advisor, not a vendor.",
  agency:
    "Write 300–450 words. Professional agency voice — mention your process, quality assurance, communication cadence, and scalability. Build trust through systematic approach. Show this is a repeatable, professional operation.",
};

const PLATFORM_TIPS: Record<Platform, string> = {
  upwork:
    "Upwork clients skim. First 2 sentences are shown in preview — make them count. Don't start with 'Dear' or 'Hello'. Use short paragraphs.",
  freelancer:
    "Freelancer.com has many low-bid competitors. Differentiate on quality and expertise, not price. Be clear about what makes you different.",
  toptal:
    "Toptal clients expect elite-level communication. Be precise, technical, and demonstrate that you understand their business context.",
  direct:
    "This is a direct client, not a platform. Write like a business professional reaching out — warm but authoritative.",
  other:
    "Write in a professional, platform-agnostic tone that works across any channel.",
};

export interface ProposalPromptParams {
  jobPost: string;
  style: ProposalStyle;
  platform: Platform;
  extraContext?: string;
  userBio?: string;
  skills?: string[];
  experienceYears?: number;
}

export function buildProposalMessages(
  params: ProposalPromptParams
): Array<{ role: "system" | "user"; content: string }> {
  const {
    jobPost,
    style,
    platform,
    extraContext,
    userBio,
    skills,
    experienceYears,
  } = params;

  const freelancerContext = [
    userBio ? `About me: ${userBio}` : "",
    experienceYears ? `Years of experience: ${experienceYears}` : "",
    skills?.length ? `Key skills: ${skills.join(", ")}` : "",
    extraContext ? `Additional context: ${extraContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const system = `You are a world-class freelance proposal writer. You've helped freelancers win thousands of projects by writing proposals that are direct, specific, and focused on client outcomes.

Your proposals:
- NEVER start with "Hi", "Hello", "I saw your job posting", "I am interested", or any generic opener
- Always open with a hook that addresses the client's core problem or goal directly
- Show expertise through specifics — name technologies, approaches, or past results
- Are easy to scan — short paragraphs, no walls of text
- End with exactly ONE clear call-to-action

You follow the style and platform guidelines given to you precisely. You output ONLY the proposal text — no labels, headers, explanations, or meta-commentary.`;

  const user = `Write a winning proposal for this job posting.

PROPOSAL STYLE: ${style.toUpperCase()}
${STYLE_GUIDE[style]}

PLATFORM: ${platform.toUpperCase()}
${PLATFORM_TIPS[platform]}

FREELANCER BACKGROUND:
${freelancerContext || "A skilled professional with relevant expertise in the required area."}

JOB POST:
${jobPost}

STRICT RULES:
1. Do NOT use: "I am perfect for this", "I am a quick learner", "I would love to work with you", "Look no further", "I am writing to express my interest"
2. Do NOT start with "Hi", "Hello", "Dear", or "Greetings"
3. Address the specific requirements in the job post — no generic proposals
4. Keep sentences under 20 words where possible
5. Write in first person, active voice

Write the proposal now:`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
