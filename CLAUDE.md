# AI Freelancer OS — Claude Code Master Rules

## What We Are Building
**AI Freelancer Operating System** — not a text generator.
A SaaS that helps freelancers & agencies close clients faster via AI-powered proposals, replies, estimates, CRM, and workflow automation.

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + TailwindCSS + shadcn/ui |
| Backend | Supabase (auth, PostgreSQL, storage, RLS) + Next.js Server Actions / API Routes |
| AI | OpenAI SDK |
| Payments | Razorpay |
| Hosting | Vercel |
| Language | TypeScript (strict — no `any`) |

---

## Architecture — MVC Pattern

Every feature follows **Model → Controller → View** separation.

```
Model      → Supabase DB tables + TypeScript types (src/types/, src/lib/db/)
Controller → Server Actions / API Route Handlers (src/actions/, src/app/api/)
View       → React Server/Client Components (src/app/, src/components/)
```

### Rules
- **Models** define shape of data. Every entity has a TypeScript interface + Supabase table.
- **Controllers** handle ALL business logic. Views never call OpenAI or DB directly.
- **Views** are dumb — they receive data via props or server components, they render.
- Never mix DB queries inside UI components.
- Server Actions = the controller layer for mutations.
- API Routes = controller layer for external/webhook calls.

---

## Project Structure

```
E:\UPWORK_BIDDING\
  src/
    app/
      (auth)/          # login, register, forgot-password
      (dashboard)/     # all protected pages
        dashboard/
        proposal/
        reply/
        estimator/
        history/
        crm/
        billing/
        settings/
      api/             # API route handlers (webhooks, external)
      layout.tsx
      page.tsx         # landing page
    components/
      ui/              # shadcn/ui primitives (Button, Input, Card…)
      shared/          # reusable app-level components (Navbar, Sidebar, PageHeader…)
      features/        # feature-specific components (ProposalCard, LeadRow…)
    lib/
      supabase/
        client.ts      # browser client
        server.ts      # server client (cookies)
        admin.ts       # service role (server-only)
      openai/
        client.ts
        prompts/       # all prompt templates
      razorpay/
        client.ts
      logger.ts        # structured logger (see Logging section)
      utils.ts
      constants.ts
      validations.ts   # zod schemas
    hooks/             # custom React hooks (client-side only)
    types/
      database.ts      # Supabase generated + custom DB types
      index.ts         # all app types exported
    actions/           # Next.js Server Actions
      proposal.ts
      reply.ts
      estimator.ts
      crm.ts
      billing.ts
  public/
  .env.local
  CLAUDE.md
```

---

## Structured Logging

**Every log must have:** `timestamp`, `file`, `level`, `message`, `context?`

### Logger (`src/lib/logger.ts`) — always use this, never use `console.log` directly

```typescript
// Log format:
// [2025-05-25T10:30:00.000Z] [INFO] [proposal/actions.ts] Message | { context }

const log = {
  info:  (file, message, context?) => ...
  warn:  (file, message, context?) => ...
  error: (file, message, error?, context?) => ...
  debug: (file, message, context?) => ...  // dev only
  http:  (file, message, req?) => ...      // HTTP requests/responses
  db:    (file, message, context?) => ...  // DB query logs (no data values)
  ai:    (file, message, context?) => ...  // AI calls (log tokens, no user content)
}
```

### Log Levels
| Level | When to Use |
|-------|------------|
| `info` | Normal operations — user signed in, proposal generated |
| `warn` | Something unexpected but not broken — rate limit approaching |
| `error` | Something failed — DB error, API failure, uncaught exception |
| `debug` | Dev/troubleshooting only — never in production |
| `http` | Incoming requests, response codes, latency |
| `db` | Query execution, index hits, slow queries |
| `ai` | OpenAI calls — model, tokens used, latency (NEVER log prompt content) |

### 🚫 NEVER Log
- Passwords, tokens, API keys
- Full user emails (log partial: `user@***.com`)
- Proposal content or personal client data
- Credit card or payment details
- Full JWT tokens or session cookies
- Raw SQL queries with user-supplied values

---

## Security Standards

### Authentication & Sessions
- Use **HTTP-only cookies** for session storage — never `localStorage` for auth tokens
- Supabase SSR client reads session from cookies server-side
- Cookie flags: `HttpOnly: true`, `Secure: true` (prod), `SameSite: Strict`
- Session expiry: enforce on server, don't trust client claims

### CSRF & Origin
- `SameSite=Strict` on all auth cookies prevents cross-site request forgery
- API routes validate `Origin` header against allowlist
- Server Actions are safe by default (Next.js CSRF protection built-in)
- External webhooks (Razorpay) must verify signature before processing

### SQL Injection
- **NEVER** build raw SQL strings with user input
- Always use Supabase query builder (parameterized by default)
- If raw SQL needed (edge cases), use `$1, $2` parameterized queries only
- Validate ALL user input with Zod before it touches the DB

### Input Validation
- Every form input validated with **Zod** schema on server side
- Client-side validation is UX only — server always re-validates
- Sanitize rich text input (proposals/replies) — strip dangerous HTML
- Rate limit AI generation endpoints (per user, per minute)

### Data Access
- **Row Level Security (RLS)** enabled on ALL Supabase tables — no exceptions
- Every table has `user_id UUID REFERENCES auth.users(id)`
- Users can only read/write their own data — enforced at DB level
- Service role key only used in server-side code, never exposed to client

### Environment & Secrets
- All secrets in `.env.local` — never in code
- Client-side env vars prefix: `NEXT_PUBLIC_` — never put secrets there
- `.env.local` never committed to git (in `.gitignore`)

### HTTP Security Headers
Every response includes:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [configured per page]
```

---

## Database Design Rules

### Every Table Must Have
```sql
id          UUID DEFAULT gen_random_uuid() PRIMARY KEY
user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
```

### Indexing Strategy — Always index:
| Index Type | When | Example |
|-----------|------|---------|
| Primary Key | Always (auto) | `id` |
| Foreign Key | Every FK column | `user_id`, `proposal_id` |
| Query Filter | Columns in WHERE | `status`, `is_deleted` |
| Sort Column | Columns in ORDER BY | `created_at`, `updated_at` |
| Composite | Multi-column queries | `(user_id, created_at)` |
| Partial | Filtered subsets | `WHERE is_deleted = false` |
| Full-Text | Search fields | `to_tsvector(title || content)` |

```sql
-- Example: proposals table
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_user_created ON proposals(user_id, created_at DESC);
CREATE INDEX idx_proposals_status ON proposals(status) WHERE is_deleted = false;
```

### Never Do
- Tables without RLS
- FK columns without indexes
- Storing arrays as comma-separated strings (use JSONB or junction tables)
- Unindexed columns used in WHERE or ORDER BY on large tables

---

## Backend & Node.js Performance

### Event Loop Rules
- **Never block the event loop** — no `fs.readFileSync`, no CPU-heavy loops in request handlers
- All I/O must be async/await — DB calls, file ops, API calls
- OpenAI streaming responses → use streaming API, don't wait for full response
- Long AI tasks → offload to background (Supabase Edge Functions or queue)

### Worker Pattern
- Heavy computation (PDF generation, bulk exports) → Web Workers or separate processes
- Proposal batch generation → queue-based processing, not blocking HTTP
- Use `Promise.all()` for parallel independent operations, not sequential awaits

### Performance Habits
```typescript
// ✅ Parallel — do this
const [proposals, replies, stats] = await Promise.all([
  getProposals(userId),
  getReplies(userId),
  getStats(userId)
])

// ❌ Sequential — never for independent calls
const proposals = await getProposals(userId)
const replies = await getReplies(userId)
const stats = await getStats(userId)
```

---

## UI/UX Design Principles

### Think Like a Designer — Always
Before building any page, think:
1. **What is the user trying to DO?** (job-to-be-done)
2. **What's the primary action?** Make it the most prominent element
3. **What causes friction?** Remove it
4. **What gives confidence?** Show status, progress, feedback

### Visual Hierarchy
- One clear **primary CTA** per screen — never compete with 3 buttons
- Use size, weight, color to guide eye: Big Title → Subtext → Action
- Group related things together (Gestalt: proximity)
- White space is not wasted space — it focuses attention

### Layout Rules
```
Sidebar navigation (desktop)     → fixed left, 240px
Main content area                → flex-1, max-w-4xl centered
Page header                      → title + subtitle + primary action (top right)
Cards/tables                     → consistent padding (p-6), rounded-xl, border
Empty states                     → illustration + message + action CTA
Loading states                   → skeleton screens (not spinners)
Error states                     → clear message + what to do next
```

### Color System (Tailwind)
- **Primary:** indigo-600 (actions, CTAs, links)
- **Success:** green-600 (won, saved, completed)
- **Warning:** amber-500 (follow-up needed, low budget)
- **Danger:** red-600 (errors, lost, delete)
- **Neutral:** gray-50 bg / gray-900 text
- **Dark mode:** supported from day one

### Component Reusability Rules
- If used in 2+ places → extract to `components/shared/`
- If it has business logic → it's a feature component in `components/features/`
- If it's just shadcn primitive → stays in `components/ui/`
- Every component: TypeScript props interface, no implicit any
- Components accept `className` prop for extension via `cn()` utility

### Responsive Design
- Mobile-first: design for 375px, enhance for desktop
- Sidebar collapses to bottom nav on mobile
- Tables → cards on mobile
- Never horizontal scroll on mobile

---

## Reusable Component Checklist
Every component must have:
- [ ] TypeScript interface for props
- [ ] Default props where sensible
- [ ] Loading state handling
- [ ] Empty/error state handling
- [ ] Responsive behavior
- [ ] `className` prop for overrides
- [ ] Accessible: `aria-label`, keyboard nav where needed

---

## Key Pages & Their Purpose
| Route | Purpose | Primary Action |
|-------|---------|---------------|
| `/` | Convert visitors | "Get Started Free" |
| `/dashboard` | Overview + quick actions | "Generate Proposal" |
| `/proposal` | Core AI feature | "Generate" button |
| `/reply` | Reply assistant | "Generate Reply" |
| `/estimator` | Project scoping | "Estimate Project" |
| `/history` | Past generations | Filter, copy, reuse |
| `/crm` | Lead pipeline | Kanban or table view |
| `/billing` | Upgrade plan | "Upgrade to Pro" |
| `/settings` | Profile, tone, templates | Save preferences |

---

## Pricing Plans
- **Free** — 5 proposals/month, basic templates
- **Pro** — Unlimited, CRM, history, personalization
- **Agency** — Team workspace, analytics, bulk generation

---

## Engineering Mindset
Think beyond software:
- **Systems thinking** — every feature affects every other feature
- **Reliability** — what happens when OpenAI is down? Supabase is slow? Fallbacks exist.
- **Scalability** — build it right for 10 users AND 10,000 users
- **Economics** — OpenAI tokens cost money; cache where possible, prompt-engineer for brevity
- **User psychology** — freelancers are stressed, time-poor, competitive; every second saved matters
- **Security is not a feature** — it's the foundation, non-negotiable from day one
