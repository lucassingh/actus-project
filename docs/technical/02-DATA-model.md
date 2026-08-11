# 02 — Data Model

## Entity overview

```
Tenant (= Clerk Organization)
  └─► User (= Clerk User, member of Organization)
        └─► Event (incident / maintenance / control)
              ├─► conversation_history (JSONB — chat turns)
              └─► KnowledgeBase (created when event is resolved)
```

## Key design decisions

- `Tenant.clerkOrgId` links to Clerk Organization — source of truth for members/roles
- `User.clerkUserId` links to Clerk User — no passwords stored in our DB
- `Event.conversationHistory` stores the full chat as JSONB (not a separate table) — simpler for MVP
- `KnowledgeBase.problemEmbedding` is a `vector(1536)` column — requires pgvector extension on Neon
- All tenant-scoped queries include `WHERE tenant_id = ?` enforced at middleware level

## Prisma schema (source of truth: `apps/web/prisma/schema.prisma`)

See [`apps/web/prisma/schema.prisma`](../../apps/web/prisma/schema.prisma) for the authoritative schema.

## Migration from v1 (Python/SQLAlchemy)

| v1 model | v2 Prisma model | Notes |
|---|---|---|
| `tenants` | `Tenant` | Added `clerkOrgId` |
| `users` | `User` | Removed `hashed_password`, added `clerkUserId` |
| `events` | `Event` | `conversation_history` unchanged (JSONB) |
| `knowledge_base` | `KnowledgeBase` | `problem_embedding` now `Unsupported("vector(1536)")` |
| `factory_docs` | `FactoryDoc` | Kept for document upload feature |
| `invitations` | Removed | Handled by Clerk Organizations invitations |
| `ui_config` | Removed | Not needed for MVP v2 |
