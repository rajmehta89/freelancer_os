"use client";

/**
 * SettingsClient — full settings form.
 * Calls saveSettings server action on submit.
 */

import { useState, useTransition } from "react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { cn }        from "@/lib/utils";
import { saveSettings } from "@/actions/settings";
import {
  Check, AlertCircle, ChevronDown,
  User, Briefcase, Sparkles, Bell,
} from "lucide-react";
import type { UserProfile, UserPreferences, ProposalStyle, Platform, Tone } from "@/types";

// ── Option lists ─────────────────────────────────────────────
const TONES: Array<{ id: Tone; label: string; desc: string }> = [
  { id: "professional", label: "Professional", desc: "Formal, polished, authoritative" },
  { id: "confident",    label: "Confident",    desc: "Direct, assured, no hedging"    },
  { id: "casual",       label: "Casual",       desc: "Friendly, approachable, warm"   },
  { id: "friendly",     label: "Friendly",     desc: "Warm but still professional"    },
];

const PROPOSAL_STYLES: Array<{ id: ProposalStyle; label: string }> = [
  { id: "concise",   label: "⚡ Concise"   },
  { id: "technical", label: "🔧 Technical" },
  { id: "premium",   label: "💎 Premium"   },
  { id: "agency",    label: "🏢 Agency"    },
];

const PLATFORMS: Array<{ id: Platform; label: string }> = [
  { id: "upwork",     label: "Upwork"        },
  { id: "freelancer", label: "Freelancer.com" },
  { id: "toptal",     label: "Toptal"         },
  { id: "direct",     label: "Direct Client"  },
  { id: "other",      label: "Other"          },
];

// ── Props ────────────────────────────────────────────────────
interface SettingsClientProps {
  profile: UserProfile;
  prefs:   UserPreferences | null;
}

// ── Component ────────────────────────────────────────────────
export function SettingsClient({ profile, prefs }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [status,    setStatus]       = useState<"idle" | "success" | "error">("idle");
  const [errMsg,    setErrMsg]       = useState("");

  // ── Controlled state (all fields) ────────────────────────
  const [fullName,    setFullName]    = useState(profile.full_name ?? "");
  const [tone,        setTone]        = useState<Tone>(prefs?.tone ?? "professional");
  const [writingStyle, setWritingStyle] = useState(prefs?.writing_style ?? "");
  const [bioSummary,  setBioSummary]  = useState(prefs?.bio_summary ?? "");
  const [hourlyRate,  setHourlyRate]  = useState(String(prefs?.hourly_rate ?? ""));
  const [skills,      setSkills]      = useState((prefs?.skills ?? []).join(", "));
  const [experienceYears, setExperienceYears] = useState(String(prefs?.experience_years ?? ""));
  const [portfolioUrl,    setPortfolioUrl]    = useState(prefs?.portfolio_url ?? "");
  const [defaultStyle,    setDefaultStyle]    = useState<ProposalStyle>(prefs?.default_proposal_style ?? "concise");
  const [defaultPlatform, setDefaultPlatform] = useState<Platform>(prefs?.default_platform ?? "upwork");
  const [emailFollowup,   setEmailFollowup]   = useState(prefs?.email_on_followup ?? true);
  const [emailTips,       setEmailTips]       = useState(prefs?.email_on_tips ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");

    const fd = new FormData();
    fd.append("fullName",             fullName);
    fd.append("tone",                 tone);
    fd.append("writingStyle",         writingStyle);
    fd.append("bioSummary",           bioSummary);
    fd.append("hourlyRate",           hourlyRate);
    fd.append("skills",               skills);
    fd.append("experienceYears",      experienceYears);
    fd.append("portfolioUrl",         portfolioUrl);
    fd.append("defaultProposalStyle", defaultStyle);
    fd.append("defaultPlatform",      defaultPlatform);
    fd.append("emailOnFollowup",      String(emailFollowup));
    fd.append("emailOnTips",          String(emailTips));

    startTransition(async () => {
      const result = await saveSettings(fd);
      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrMsg(result.error);
      }
    });
  }

  // ── Section wrapper ───────────────────────────────────────
  function Section({ icon, title, children }: {
    icon: React.ReactNode; title: string; children: React.ReactNode;
  }) {
    return (
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
          <span className="text-indigo-400">{icon}</span>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    );
  }

  // ── Toggle ────────────────────────────────────────────────
  function Toggle({ checked, onChange, label }: {
    checked: boolean; onChange: (v: boolean) => void; label: string;
  }) {
    return (
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-gray-300">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            checked ? "bg-indigo-600" : "bg-gray-700"
          )}
        >
          <span className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
      </label>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Profile ─────────────────────────────────────── */}
      <Section icon={<User className="h-4 w-4" />} title="Profile">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          maxLength={80}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            value={profile.email}
            disabled
            className="w-full rounded-xl border border-white/5 bg-gray-800/40 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-600">Email cannot be changed here</p>
        </div>
      </Section>

      {/* ── Business Info ────────────────────────────────── */}
      <Section icon={<Briefcase className="h-4 w-4" />} title="Business Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hourly Rate (USD)"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="e.g. 75"
            min="0"
            max="10000"
          />
          <Input
            label="Years of Experience"
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g. 5"
            min="0"
            max="60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Skills</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="react, node.js, typescript, postgresql, ..."
            className="w-full rounded-xl border border-white/8 bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 hover:border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-600">Comma-separated — used to personalise proposals</p>
        </div>

        <Input
          label="Portfolio URL"
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://yourportfolio.com"
          maxLength={300}
        />
      </Section>

      {/* ── AI Preferences ───────────────────────────────── */}
      <Section icon={<Sparkles className="h-4 w-4" />} title="AI Preferences">

        {/* Tone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Default Writing Tone</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                  tone === t.id
                    ? "border-indigo-500/60 bg-indigo-600/15 ring-1 ring-indigo-500/30"
                    : "border-white/5 bg-gray-950/30 hover:border-white/10"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  tone === t.id ? "text-indigo-300" : "text-gray-300"
                )}>{t.label}</span>
                <span className="text-xs text-gray-600">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bio for AI */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Bio for AI{" "}
            <span className="text-gray-600 font-normal text-xs">(used to personalise every proposal)</span>
          </label>
          <textarea
            value={bioSummary}
            onChange={(e) => setBioSummary(e.target.value)}
            placeholder="e.g. I'm a full-stack developer with 6 years of experience building SaaS products. I specialise in React, Node.js, and PostgreSQL. I've delivered 40+ projects on Upwork with a 98% JSS..."
            rows={4}
            maxLength={500}
            className="w-full rounded-xl border border-white/8 bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 resize-none hover:border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-600 text-right">{bioSummary.length} / 500</p>
        </div>

        {/* Writing style */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Writing Style Hints{" "}
            <span className="text-gray-600 font-normal text-xs">(optional)</span>
          </label>
          <input
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            placeholder="e.g. direct, no fluff, technical depth, avoid buzzwords"
            maxLength={200}
            className="w-full rounded-xl border border-white/8 bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600 hover:border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Default proposal style */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Default Proposal Style</label>
          <div className="flex flex-wrap gap-2">
            {PROPOSAL_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setDefaultStyle(s.id)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  defaultStyle === s.id
                    ? "border-indigo-500/60 bg-indigo-600/15 text-indigo-300"
                    : "border-white/5 bg-gray-950/30 text-gray-400 hover:border-white/10 hover:text-gray-300"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default platform */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Default Platform</label>
          <div className="relative w-48">
            <select
              value={defaultPlatform}
              onChange={(e) => setDefaultPlatform(e.target.value as Platform)}
              className="w-full appearance-none rounded-xl border border-white/8 bg-gray-950/60 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </Section>

      {/* ── Notifications ────────────────────────────────── */}
      <Section icon={<Bell className="h-4 w-4" />} title="Notifications">
        <div className="space-y-4">
          <Toggle
            label="Email me follow-up reminders"
            checked={emailFollowup}
            onChange={setEmailFollowup}
          />
          <Toggle
            label="Email me freelancing tips & product updates"
            checked={emailTips}
            onChange={setEmailTips}
          />
        </div>
      </Section>

      {/* ── Submit ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          {status === "success" && (
            <p className="flex items-center gap-1.5 text-sm text-green-400">
              <Check className="h-4 w-4" /> Settings saved!
            </p>
          )}
          {status === "error" && (
            <p className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {errMsg}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
