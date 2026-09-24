# CLAUDE.md — Actus V2 Workspace

This file provides guidance to Claude Code when working across the full `ACTUS-V2/` monorepo.

## Workspace layout

```
ACTUS-V2/
  apps/
    web/        # Next.js — public landing (/), dashboard (admin/supervisor), API + WhatsApp webhook
  packages/
    types/      # Shared TypeScript types (events, users, tenants, agent)
  docs/
    commercial/ # Business context, MVP, pricing, onboarding guides
    technical/  # Architecture, flows, API contracts, decisions
```

`apps/web` is the only app. The former Expo mobile app and the standalone `apps/landing` were removed: operators use WhatsApp, and the landing is served by `apps/web` at `/` (redirects to `/dashboard` when signed in).

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript — all code in English |
| Auth | Clerk (Organizations = multi-tenancy) |
| Database | PostgreSQL on Neon (serverless) |
| ORM | Prisma |
| Vector search | pgvector via Prisma raw queries |
| AI Agent | Anthropic Claude API (claude-haiku for agent, claude-sonnet for complex) |
| Styling | Tailwind CSS + shadcn/ui |
| Monorepo | Turborepo |
| Deployment | Vercel (single project, root directory `apps/web`) |

---

## Architecture overview

```
[Operator's WhatsApp]
      │ Meta Cloud API webhook
      ▼
[apps/web — Next.js API Routes]
      │
      ├─► /api/v1/whatsapp/webhook — HMAC-authenticated, no Clerk session (see below)
      ├─► /api/v1/auth/*      — Clerk webhook sync + session
      ├─► /api/v1/events/*    — CRUD events (incidents, maintenance)
      ├─► /api/v1/agent/*     — AgentService: text/audio/image → Claude → KB
      ├─► /api/v1/tenants/*   — Admin-only tenant management
      └─► /api/v1/users/*     — User management within tenant
      │
      ▼
[Prisma → Neon PostgreSQL + pgvector]

[Dashboard — Next.js App Router pages]
      │ Server Components + Server Actions
      └─► /dashboard/events, /dashboard/operators, /dashboard/kb, ...
```

Operators report incidents via WhatsApp (text/audio/image), not the mobile app — see
[`docs/technical/08-WHATSAPP-integration.md`](docs/technical/08-WHATSAPP-integration.md).
Supervisors/admins use the web dashboard via Clerk. The mobile app was removed; its REST
routes (`/api/v1/agent/message`, `/api/v1/auth/me`, `/api/v1/events/*`) remain in the
codebase but have no client today.

### Authentication & multi-tenancy

- Clerk handles auth for the dashboard (web) and the Bearer-token REST routes (JWT verification via Clerk SDK) — **operators no longer have Clerk accounts**, they're identified by `User.phoneNumber` instead (see [`docs/technical/04-ROLES-and-tenancy.md`](docs/technical/04-ROLES-and-tenancy.md))
- Each industrial company = one Clerk Organization
- Roles: `admin` (system), `supervisor` (org admin), `operator` (phone number, WhatsApp)
- Next.js middleware enforces tenant isolation on every API route, except `/api/v1/whatsapp/webhook` which authenticates via HMAC signature instead of a Clerk session

### Agent flow (replaces n8n + Gemini)

```
WhatsApp webhook (or POST /api/v1/agent/message)
  → AgentService.processInput(text | audio | image)
  → KnowledgeBaseService.search(query, tenantId)   // pgvector RAG
  → Claude API (system prompt + KB context + conversation history)
  → extractEventUpdate(response)                   // parse structured output
  → save to Event.conversation_history
  → return { response, eventUpdate }
```

---

## Per-repo references

| App | CLAUDE.md | Docs index |
|---|---|---|
| `apps/web` | [`apps/web/CLAUDE.md`](apps/web/CLAUDE.md) | [`docs/technical/00-INDEX.md`](docs/technical/00-INDEX.md) |

---

## Development principles

### Code style
- **All code, variables, comments, and commit messages in English**
- Follow **SOLID** and **DRY** — no duplicate logic between API routes and services
- No `any` types — use types from `packages/types` or define locally
- Server Components by default; `"use client"` only when strictly needed
- No comments explaining *what* code does — only *why* when non-obvious

### File naming
- Documentation: `NN-TOPIC-about.md` (e.g. `01-AGENT-architecture.md`)
- Components: PascalCase (`EventCard.tsx`)
- Services/utils: camelCase (`agentService.ts`)
- API routes: Next.js conventions (`route.ts`)

---

## Mandatory work methodology

**These rules apply to every task in this monorepo.**

### Phase 1: Planning (NO code)
- Do not write code until I explicitly say **"EJECUTAR"** or **"CONTINUAR"**
- Read relevant docs in `docs/technical/` or `docs/commercial/` first
- Propose a detailed step-by-step plan
- If anything is unclear, **ASK before assuming**

**Required plan format:**

```
📋 PLAN FOR [TASK NAME]:
Step 1: [description]
Step 2: [description]
...
Files to create/modify:
- path/file1
- path/file2
Ready to start?
```

### Phase 2: Controlled execution
- Implement ONE step at a time
- After each step: `CHECKPOINT: [step completed]`
- Wait for "CONTINUAR" before the next step
- If something fails or is unclear, STOP and ask

**Required format during execution:**

```
✅ EXECUTING STEP X:
[code or action]

CHECKPOINT: Step X complete.
Files modified: [list]
Waiting for "CONTINUAR"...
```

### Phase 3: Automatic documentation (always at the end)
When a task is FULLY complete:
1. Create or update a file in `docs/technical/` following the `NN-TOPIC-about.md` naming convention
2. Update this `CLAUDE.md` if the architecture changed
3. If a change affects the REST API contract, note it in `docs/technical/03-API-contracts.md`

### Restrictions (always apply)
- **NEVER** modify more than 3 files without a checkpoint
- **NEVER** refactor code that wasn't part of the task
- **NEVER** delete code without asking first
- **NEVER** move to the next step without "CONTINUAR"
- **ALWAYS** document what was done before marking a step complete

### When in doubt

```
❓ DOUBT: [specific question]
Options:
- Option A: [description]
- Option B: [description]
Which do you prefer?
```

Do not assume. Do not invent. Ask.

---

## Common commands

### Root (monorepo)
```bash
npm run dev          # Start apps/web via Turborepo (localhost:3001)
npm run build        # Build apps/web
npm run db:push      # Push Prisma schema to Neon (dev)
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations (prod)
```

### apps/web
```bash
cd apps/web
npm run dev          # Next.js dev server (localhost:3001)
npm run build
npm run lint
npm run type-check
npx prisma studio    # Browse DB
npx prisma db push   # Sync schema to Neon
```

---

## Key docs

- Agent architecture: [`docs/technical/01-AGENT-architecture.md`](docs/technical/01-AGENT-architecture.md)
- Data model: [`docs/technical/02-DATA-model.md`](docs/technical/02-DATA-model.md)
- API contracts (REST): [`docs/technical/03-API-contracts.md`](docs/technical/03-API-contracts.md)
- Multi-tenancy & roles: [`docs/technical/04-ROLES-and-tenancy.md`](docs/technical/04-ROLES-and-tenancy.md)
- End-to-end testing guide: [`docs/technical/05-TESTING-circuit.md`](docs/technical/05-TESTING-circuit.md)
- WhatsApp integration: [`docs/technical/08-WHATSAPP-integration.md`](docs/technical/08-WHATSAPP-integration.md)
- MVP scope: [`docs/commercial/01-MVP-scope.md`](docs/commercial/01-MVP-scope.md)
