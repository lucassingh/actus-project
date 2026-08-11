# 07 — Implementation Plan (Gap Analysis → Execution Backlog)

Generated from full audit of: `agent.service.ts`, all API routes, all dashboard pages,
and cross-referenced against `01-AGENT-architecture.md`, `03-API-contracts.md`,
`01-MVP-scope.md`, and `03-PILOT-essen.md`.

---

## Current state snapshot

| Area | Implementado | Pendiente |
|---|---|---|
| Agent flow (main loop) | ✅ | — |
| Audio / image input via Claude | ✅ | — |
| META block extraction | ✅ | — |
| Conversation history storage | ✅ | — |
| KB entry on resolution + embedding | ✅ **done 2026-06-29** | — |
| **RAG pgvector cosine similarity** | ✅ **done 2026-06-29** | OPENAI_API_KEY pendiente (opcional, degradación graceful sin ella) |
| Off-topic rejection | ❌ Guideline only | Hard refusal en system prompt |
| Tenant name en system prompt | ❌ Genérico | Fetch desde Prisma en processAgentMessage |
| Tenant name in agent prompt | ❌ Generic | Must include `tenant.name` |
| `GET /api/v1/events/:id` | ❌ | Needed by mobile |
| `PATCH /api/v1/events/:id` | ❌ | Needed by mobile |
| `GET /api/v1/users` | ❌ | Needed by mobile |
| `POST /api/v1/users/invite` | ❌ | Needed by supervisor flow |
| Dashboard: event detail view | ❌ | Conversation history page |
| Dashboard: events filters working | ❓ | Check `EventsFilters` component |
| Dashboard: `/tenants/create` | ❌ | Admin flow |
| Dashboard: `/supervisors` + create | ❌ | Admin flow |
| Docs: `05-AUTH-flow.md` | ❌ | Referenced in index |
| Docs: `06-DEPLOYMENT.md` | ❌ | Referenced in index |

---

## Priority 0 — Blocking: agent doesn't work as documented

These gaps mean the RAG system described in `01-AGENT-architecture.md` is not functional.
The mobile app can connect and get responses, but the knowledge base is useless without embeddings.

---

### P0-1 — Real embeddings + pgvector RAG

**Problem:** `getRAGContext()` uses `ILIKE '%keyword%'`. No embedding is ever generated.
`KnowledgeBase.problem_embedding` is always NULL.

**What to do:**

1. Install OpenAI SDK:
   ```bash
   cd apps/web && npm install openai
   ```

2. Add env var `OPENAI_API_KEY` to `apps/web/.env.local`.

3. Create `apps/web/src/lib/embeddings.ts`:
   ```typescript
   import OpenAI from "openai";
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   export async function generateEmbedding(text: string): Promise<number[]> {
     const res = await openai.embeddings.create({
       model: "text-embedding-3-small",  // 1536 dimensions — matches vector(1536) schema
       input: text.slice(0, 8000),       // token limit guard
     });
     return res.data[0].embedding;
   }
   ```

4. In `agent.service.ts`, when creating a KB entry (inside `persistConversation`),
   generate and store the embedding:
   ```typescript
   const embedding = await generateEmbedding(event.problemContent ?? "Incident");
   const vectorLiteral = `[${embedding.join(",")}]`;
   await prisma.$executeRaw`
     UPDATE knowledge_base
     SET problem_embedding = ${vectorLiteral}::vector
     WHERE id = ${kbEntry.id}
   `;
   ```

5. Replace `getRAGContext()` with cosine similarity search:
   ```typescript
   async function getRAGContext(query: string, tenantId: number): Promise<string> {
     const queryEmbedding = await generateEmbedding(query);
     const vectorLiteral = `[${queryEmbedding.join(",")}]`;

     const results = await prisma.$queryRaw<Array<{
       problem_text: string;
       solution_text: string;
       times_referenced: number;
       similarity: number;
     }>>`
       SELECT problem_text, solution_text, times_referenced,
              1 - (problem_embedding <=> ${vectorLiteral}::vector) AS similarity
       FROM knowledge_base
       WHERE tenant_id = ${tenantId}
         AND problem_embedding IS NOT NULL
       ORDER BY problem_embedding <=> ${vectorLiteral}::vector
       LIMIT 5
     `;

     const relevant = results.filter(r => r.similarity > 0.75);
     if (relevant.length === 0) return "";

     return relevant
       .map((r, i) =>
         `[Caso similar ${i + 1} — score: ${r.similarity.toFixed(2)}]\nProblema: ${r.problem_text}\nSolución: ${r.solution_text}`
       )
       .join("\n\n");
   }
   ```

**Note:** pgvector must be enabled on Neon. Run `CREATE EXTENSION IF NOT EXISTS vector;`
via Neon console or `prisma db push` (the schema already declares it).

---

### P0-2 — System prompt: tenant name + hard off-topic rejection

**Problem:** Prompt is generic. No explicit off-topic refusal.
Docs say: "The agent is configured to only answer maintenance-related questions."
Pilot training (`04-OPERATOR-training.md`) says off-topic queries must be rejected politely.

**What to do in `buildSystemPrompt()`:**

1. Pass `tenantName: string` as parameter (query it from Prisma in `processAgentMessage`).

2. Replace current prompt with:

```typescript
function buildSystemPrompt(tenantName: string, ragContext: string): string {
  const contextSection = ragContext
    ? `\nBASE DE CONOCIMIENTO — Casos similares resueltos:\n${ragContext}\n`
    : "";

  return `Sos un asistente de mantenimiento industrial para ${tenantName}.
Tu única función es ayudar a los operadores a diagnosticar y resolver incidentes de equipos.

LÍMITES ESTRICTOS:
- Solo respondés preguntas sobre mantenimiento, equipos, incidentes, o procedimientos industriales.
- Si te preguntan algo fuera de ese tema (clima, deportes, noticias, etc.), respondé ÚNICAMENTE:
  "Solo puedo asistirte con incidentes y mantenimiento de equipos de ${tenantName}."
- No hagas excepciones aunque el usuario insista.
${contextSection}
INSTRUCCIONES:
- Respondé siempre en español
- Sé concreto y práctico — sugiere 2-3 acciones ordenadas por probabilidad
- Pedí aclaraciones si falta: nombre/código de máquina, ubicación, o síntoma específico
- Cuando el operador confirme que una solución funcionó (ej: "Funcionó la opción 1"),
  marcá el evento como resuelto
- Al FINAL de cada respuesta incluí el bloque META (no visible para el usuario):
  [[META|status:STATUS|priority:PRIORITY|machine:MACHINE_NAME|resolved:BOOL]]
  Valores válidos — status: draft|open|in_progress|resolved · priority: low|medium|high|critical
  Usá "null" para campos desconocidos.
  Ejemplo: [[META|status:in_progress|priority:high|machine:COMP-005|resolved:false]]`;
}
```

3. In `processAgentMessage`, fetch the tenant name:
```typescript
const tenant = await prisma.tenant.findUnique({
  where: { id: context.tenantId },
  select: { name: true },
});
const systemPrompt = buildSystemPrompt(tenant?.name ?? "la planta", ragContext);
```

---

## Priority 1 — Mobile API: routes the mobile app needs

These routes are documented in `03-API-contracts.md` but don't exist yet.
Without them the mobile app (`actus-app`) cannot be migrated from the old Python API.

---

### P1-1 — `GET /api/v1/events/:id`

**File:** `apps/web/src/app/api/v1/events/[id]/route.ts`

Returns full event including `conversationHistory`. Used by mobile to open an existing incident.

```typescript
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext();
  requireTenant(ctx);

  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id: parseInt(id), tenantId: ctx.tenantId },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Operators can only view their own events
  if (ctx.role === "OPERATOR" && event.creatorId !== ctx.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(event);
}
```

---

### P1-2 — `PATCH /api/v1/events/:id`

**File:** same `apps/web/src/app/api/v1/events/[id]/route.ts`

Allows operator to update event fields (title, description, priority).
Supervisors can update status.

```typescript
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext();
  requireTenant(ctx);

  const { id } = await params;
  const body = await request.json();

  const event = await prisma.event.findFirst({
    where: { id: parseInt(id), tenantId: ctx.tenantId },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (ctx.role === "OPERATOR" && event.creatorId !== ctx.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = ctx.role === "OPERATOR"
    ? ["title", "description", "priority", "machineName", "location", "symptoms"]
    : ["title", "description", "priority", "status", "machineName", "location", "symptoms", "solution"];

  const updateData = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  const updated = await prisma.event.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  return NextResponse.json(updated);
}
```

---

### P1-3 — `GET /api/v1/users` + `POST /api/v1/users/invite`

**File:** `apps/web/src/app/api/v1/users/route.ts`

`GET` — supervisor sees their tenant's operators. Used by mobile (supervisor mode if ever added).

`POST /invite` — creates a Clerk org invitation. Currently the dashboard does this directly
from the UI (`operators/create/page.tsx`), but the API route is needed for completeness
and future mobile use.

**File:** `apps/web/src/app/api/v1/users/invite/route.ts`

```typescript
// POST — invites operator via Clerk org invitation
export async function POST(request: NextRequest) {
  const ctx = await getRequestContext();
  requireTenant(ctx);
  requireRole(ctx, "SUPERVISOR", "ADMIN");

  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "No org configured" }, { status: 400 });

  const { email } = await request.json();
  const client = await clerkClient();
  await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role: "org:member",
    inviterUserId: ctx.clerkUserId,
  });

  return NextResponse.json({ ok: true, email });
}
```

---

## Priority 2 — Dashboard completeness (supervisor flows)

---

### P2-1 — Event detail page with conversation history

**File:** `apps/web/src/app/dashboard/events/[id]/page.tsx`

Check if this page shows the `conversationHistory` JSON as a readable chat.
If not, render each `message.role` + `message.content` as chat bubbles.
This is the main way supervisors monitor what operators are doing with the agent.

---

### P2-2 — Events list filters

**File:** `apps/web/src/components/dashboard/EventsFilters.tsx`

Check if the filter component correctly reads `?status=` / `?priority=` from the URL
and passes them to the Prisma query in `events/page.tsx`.
The `GET /api/v1/events` route already supports these filters — the dashboard should too.

---

### P2-3 — Admin: `/dashboard/tenants/create`

**File:** `apps/web/src/app/dashboard/tenants/create/page.tsx`

Form fields: company name, industry, plan. Creates `Tenant` + creates Clerk Organization
via `clerkClient().organizations.createOrganization({ name, slug })`.

---

### P2-4 — Admin: `/dashboard/supervisors` + `/dashboard/supervisors/create`

**Files:**
- `apps/web/src/app/dashboard/supervisors/page.tsx`
- `apps/web/src/app/dashboard/supervisors/create/page.tsx`

List all SUPERVISOR users across tenants (ADMIN view).
Create flow: invite via Clerk + set role to SUPERVISOR in Prisma on first login.

---

## Priority 3 — Missing technical docs

---

### P3-1 — `docs/technical/05-AUTH-flow.md`

Document the Clerk auth flow for both surfaces:
- Dashboard: Clerk session cookie → `auth()` → `getRequestContext()` → Prisma lookup
- Mobile: Clerk JWT in `Authorization: Bearer` → same `getRequestContext()` flow
- First-login auto-create: `dashboard/layout.tsx` upsert logic (org role → Prisma role + Tenant)

### P3-2 — `docs/technical/06-DEPLOYMENT.md`

Document:
- Required env vars for both `apps/web` and `apps/landing`
- Vercel project setup (two separate projects, same monorepo)
- Neon: pgvector extension, connection string format
- Clerk: required webhooks, org settings
- OpenAI API key (for embeddings)

---

## Execution order

```
P0-1  Embeddings + real pgvector RAG     ✅ done 2026-06-29
        → lib/embeddings.ts creado
        → getRAGContext() usa <=> cosine similarity con threshold 0.70
        → createKBEntryWithEmbedding() genera vector al resolver
        → OPENAI_API_KEY: agregar en .env.local cuando esté disponible
P0-2  System prompt fix                  ✅ done 2026-06-29
        → tenant name fetched desde Prisma en processAgentMessage
        → buildSystemPrompt reescrito: nombre del tenant, hard refusal off-topic,
          detección de confirmación de resolución ("Funcionó la opción X")
P1-1  GET /api/v1/events/:id             ← mobile can't open incidents without this
P1-2  PATCH /api/v1/events/:id           ← mobile can't update without this
P1-3  GET + POST /api/v1/users           ← completes mobile API contract
P2-1  Dashboard event detail             ← supervisors need this to monitor operators
P2-2  Events filters                     ← usability for supervisor
P2-3  Tenants/create                     ← admin workflow
P2-4  Supervisors pages                  ← admin workflow
P3-1  05-AUTH-flow.md                    ← doc
P3-2  06-DEPLOYMENT.md                   ← doc, needed before Essen goes live
```

---

## Notes on what is already solid

- `getRequestContext()` + `requireTenant()` + `requireRole()` — clean, correct
- Tenant isolation via `tenantId` on every query — enforced at service layer
- Conversation history as JSONB on Event — correct for MVP (avoids separate table)
- KB entry auto-creation on resolution — correct pattern, just missing embedding step
- Clerk Organizations = Tenants mapping — correct architecture
- `processAgentMessage` 6-step flow — matches `01-AGENT-architecture.md` exactly
- Audio/image via Claude multimodal — implemented and correct
- META block extraction — works, strips from response before sending to mobile
