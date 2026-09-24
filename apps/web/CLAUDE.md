# CLAUDE.md — apps/web

Next.js 15 app. Serves the supervisor/admin dashboard AND the REST API consumed by the mobile app (actus-app).

See root [`../../CLAUDE.md`](../../CLAUDE.md) for workspace-level methodology and stack.

## Key directories

```
src/
  app/
    (auth)/           # Clerk sign-in / sign-up pages
    dashboard/        # Supervisor and admin pages (Server Components)
    api/
      v1/
        auth/         # GET /api/v1/auth/me
        events/       # CRUD events
        agent/        # POST /api/v1/agent/message  ← legacy mobile entry
        whatsapp/     # POST /api/v1/whatsapp/webhook  ← operator's actual entry today
        users/        # User management
        tenants/      # Admin-only tenant management
  lib/
    prisma.ts         # Prisma client singleton
    clerk.ts          # Clerk server helpers + getRequestContext()
    transcription.ts  # Whisper audio transcription (Claude has no audio modality)
  services/
    agent.service.ts          # AgentService — Claude API + RAG (shared by mobile + WhatsApp)
    whatsapp.service.ts       # Send/receive via Meta Graph API
    knowledge-base.service.ts # pgvector search + KB creation
    event.service.ts
    user.service.ts
    tenant.service.ts
  middleware.ts       # Tenant isolation + Clerk auth guard (excludes /api/v1/whatsapp/webhook)
```

## Adding a new API endpoint

1. Create `src/app/api/v1/[resource]/route.ts`
2. Call `getRequestContext(request)` from `src/lib/clerk.ts` → `{ userId, tenantId, role }`
3. All DB queries must include `tenantId` from context — never trust tenantId from request body
4. Return `NextResponse.json(data)` or `NextResponse.json({ error }, { status: N })`

## Adding a new dashboard page

1. Create `src/app/dashboard/[feature]/page.tsx` as a Server Component
2. Query Prisma directly in the page — no API call needed for dashboard pages
3. Protect with `auth()` from Clerk + role check

## Scripts

```bash
npm run dev              # localhost:3000
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
