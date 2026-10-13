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

`apps/web/src/middleware.ts` (`clerkMiddleware`) runs on every route that is not in
`isPublicRoute` (landing, legal pages, sign-in/up, robots/sitemap/OG image, the WhatsApp
webhook — authenticated via HMAC signature instead, see
[`08-WHATSAPP-integration.md`](08-WHATSAPP-integration.md) —, the Inngest endpoint and the
public KB media). It only checks that a Clerk session exists: no session → `401` for
`/api/v1/*`, redirect to `/sign-in` for pages. It never touches the database.

The DB lookup happens in `apps/web/src/app/dashboard/layout.tsx`, on every dashboard render:

```
1. ensureDbUser() (lib/clerk.ts): Clerk session → User row, created or re-synced lazily
   - role: ADMIN if publicMetadata.actusAdmin === true, OPERATOR if the org role is
     org:member, SUPERVISOR otherwise
   - tenant: the session's active organization; if the session has none, the user's first
     organization membership via the Backend API (invited supervisor on a new device)
2. hasDashboardAccess(user) (lib/access.ts) decides whether there is a workspace to show
3. Each page re-reads the User row and scopes every query by its tenantId
```

## Who gets into the dashboard

| Signed-in account | Lands on |
|---|---|
| `actusAdmin` flag in public metadata | `/dashboard` (platform admin, all tenants) |
| Supervisor linked to a tenant | `/dashboard` (their company) |
| Supervisor with no tenant (nobody invited this email) | `/sin-acceso` |
| Operator (`org:member`) or `isActive = false` | `/sin-acceso` |

`/sin-acceso` (`app/sin-acceso/page.tsx`) is a **terminal** page: it says the account is not
linked to any company and offers sign-out, a support mailto and a retry link. It re-runs
`ensureDbUser()`, so a reload after accepting an invitation goes straight to the dashboard.

**Rule: never `redirect("/sign-in")` for a signed-in user.** Clerk's `<SignIn />` does not
render a form when a session is active — it redirects to the home page, and the home page
sends every signed-in user to `/dashboard`. Before this rule (2026-10-13, PR #29) an uninvited
Google sign-in looped forever between `/dashboard`, `/sign-in` and the landing. A redirect to
`/sign-in` is only valid when `auth()` returns no `userId`; a signed-in user without the right
role or tenant goes to `/dashboard` (page level) or `/sin-acceso` (layout level).

## Clerk Dashboard settings (Production instance)

- **Organizations → Membership: optional.** The platform admin has no organization;
  "required" forces org creation and loops sign-in ↔ dashboard.
- **Restrictions → Access mode: Invite-only** (API value `restricted`). Sign-ups are
  disabled and only invited emails can create an account, so an uninvited account never
  reaches `/sin-acceso` in the first place. Supervisors are invited through Clerk
  Organization invitations (`/dashboard/supervisors/create`). After switching modes, invite a
  test email and confirm the link in the email still lets it create the account. The invited
  email must be the one the person signs in with (also when they pick Google).

## Tenant isolation guarantee

Every Prisma query on tenant-scoped models includes:
```typescript
where: { tenantId: ctx.tenantId }
```

This is enforced at the service layer, not at the route layer — ensures no accidental data leak even if a route handler forgets to filter.
