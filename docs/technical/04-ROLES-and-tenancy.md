# 04 — Roles & Multi-Tenancy

## Role model

| Role | Identity | Scope | Permissions |
|---|---|---|---|
| `admin` | Clerk, system-level (no org) | All tenants | Create/delete tenants, manage supervisors |
| `supervisor` | Clerk, org admin | One tenant | Manage operators, view all events, KB access |
| `operator` | **Phone number, no Clerk account** | One tenant | Create events, use agent chat — via WhatsApp |

Operators stopped being Clerk Organization members when the mobile app was replaced by
WhatsApp — see [`08-WHATSAPP-integration.md`](08-WHATSAPP-integration.md). A `User` row
is now identified by **either** `clerkUserId` (admin/supervisor) **or** `phoneNumber`
(operator), never both. `User.clerkUserId` is `String?` (optional) for this reason.

## Clerk Organizations = Tenants

Each industrial company (tenant) maps to a Clerk Organization:
- `Tenant.clerkOrgId = org_xxxxx`
- Supervisor invitation → Clerk Organization invitation, role `org:admin`
- Operator registration → **no Clerk invitation** — supervisor enters the operator's
  WhatsApp number directly in `/dashboard/operators/create`, which creates the `User`
  row immediately (`role: OPERATOR`, `clerkUserId: null`, `phoneNumber` set)

## Middleware (Next.js)

`apps/web/src/middleware.ts` runs on every `/api/v1/*` and `/dashboard/*` route, **except**
`/api/v1/whatsapp/webhook` (explicitly excluded — Meta never sends a Clerk session; that
route authenticates its caller via HMAC signature instead, see
[`08-WHATSAPP-integration.md`](08-WHATSAPP-integration.md)):

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
