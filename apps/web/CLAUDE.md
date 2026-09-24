# CLAUDE.md — apps/web

Next.js app — the only app in the monorepo. Serves the public landing (`/`), the supervisor/admin dashboard, and the WhatsApp webhook operators use.

See root [`../../CLAUDE.md`](../../CLAUDE.md) for workspace-level methodology and stack.

## Key directories

```
src/
  app/
    (auth)/           # Clerk sign-in / sign-up pages
    dashboard/        # Supervisor and admin pages (Server Components)
    api/
      v1/
        whatsapp/     # POST /api/v1/whatsapp/webhook  ← the only API route (operators)
  lib/
    prisma.ts         # Prisma client singleton
    clerk.ts          # Clerk server helpers + getRequestContext()
    transcription.ts  # Whisper audio transcription (Claude has no audio modality)
  services/
    agent.service.ts          # AgentService — Claude API + RAG (called by the WhatsApp webhook)
    whatsapp.service.ts       # Send/receive via Meta Graph API
    knowledge-base.service.ts # pgvector search + KB creation
    event.service.ts
    user.service.ts
    tenant.service.ts
  middleware.ts       # Tenant isolation + Clerk auth guard (excludes /api/v1/whatsapp/webhook)
```

## Adding a new API endpoint

1. Create `src/app/api/v1/[resource]/route.ts`
2. Call `ensureDbUser()` from `src/lib/clerk.ts` → `{ id, tenantId, role, isActive }`
3. All DB queries must include that `tenantId` — never trust tenantId from request body
4. Return `NextResponse.json(data)` or `NextResponse.json({ error }, { status: N })`

## Adding a new dashboard page

1. Create `src/app/dashboard/[feature]/page.tsx` as a Server Component
2. Query Prisma directly in the page — no API call needed for dashboard pages
3. Protect with `auth()` from Clerk + role check

## Scripts

```bash
npm run dev              # localhost:3001
npm run build
npm run lint
npm run type-check
npx prisma db push       # Sync schema to Neon (dev — no migration file created)
npx prisma migrate dev --name <name>  # Migration for prod
npx prisma studio        # Visual DB browser
```

## Docs

- Agent flow: [`../../docs/technical/01-AGENT-architecture.md`](../../docs/technical/01-AGENT-architecture.md)
- Data model: [`../../docs/technical/02-DATA-model.md`](../../docs/technical/02-DATA-model.md)
- API contracts: [`../../docs/technical/03-API-contracts.md`](../../docs/technical/03-API-contracts.md)
- WhatsApp integration: [`../../docs/technical/08-WHATSAPP-integration.md`](../../docs/technical/08-WHATSAPP-integration.md)
