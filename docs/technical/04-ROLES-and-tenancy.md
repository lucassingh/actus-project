# 04 — Roles & Multi-Tenancy

## Role model

| Role | Clerk equivalent | Scope | Permissions |
|---|---|---|---|
| `admin` | System-level (no org) | All tenants | Create/delete tenants, manage supervisors |
| `supervisor` | Org admin | One tenant | Manage operators, view all events, KB access |
| `operator` | Org member | One tenant | Create events, use agent chat |

## Clerk Organizations = Tenants

Each industrial company (tenant) maps to a Clerk Organization:
- `Tenant.clerkOrgId = org_xxxxx`
- Operator invitation → Clerk Organization invitation
- Role assignment → Clerk Organization membership role (`admin` / `basic_member`)

## Middleware (Next.js)

`apps/web/src/middleware.ts` runs on every `/api/v1/*` and `/dashboard/*` route:

```
1. Verify Clerk session token
2. Extract clerkUserId + orgId from token
3. Look up User in DB by clerkUserId → get tenantId + role
4. Attach to request context: { userId, tenantId, role }
5. All DB queries downstream include tenantId automatically
```

## Tenant isolation guarantee

Every Prisma query on tenant-scoped models includes:
```typescript
where: { tenantId: ctx.tenantId }
```

This is enforced at the service layer, not at the route layer — ensures no accidental data leak even if a route handler forgets to filter.
