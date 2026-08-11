import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export interface RequestContext {
  clerkUserId: string;
  userId: number;
  tenantId: number | null;
  role: Role;
}

interface DbUser {
  id: number;
  clerkUserId: string;
  role: Role;
  name: string;
  isActive: boolean;
  tenantId: number | null;
}

async function upsertTenant(orgId: string): Promise<number> {
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  const tenant = await prisma.tenant.upsert({
    where: { clerkOrgId: orgId },
    update: {},
    create: {
      clerkOrgId: orgId,
      name: org.name,
      code: (org.slug ?? orgId).toUpperCase().slice(0, 20),
    },
    select: { id: true },
  });
  return tenant.id;
}

/**
 * Resolves the current Clerk session to a DB User row, creating (or fixing) it
 * lazily on first request. Shared by the web dashboard layout AND every API route
 * (including mobile) so a user's first-ever request — from either surface — bootstraps
 * their DB record. Previously this only happened in the dashboard layout, which left
 * mobile-only users (never opened the web dashboard) permanently 401'd.
 */
export async function ensureDbUser(): Promise<DbUser> {
  const { userId: clerkUserId, orgId, orgRole, sessionClaims } = await auth();
  if (!clerkUserId) {
    throw new AuthError("Unauthenticated");
  }

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  const expectedRole: Role = isActusAdmin ? "ADMIN" : orgRole === "org:member" ? "OPERATOR" : "SUPERVISOR";

  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true, name: true, isActive: true, tenantId: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new AuthError("Unauthenticated");

    const tenantId = orgId ? await upsertTenant(orgId) : null;

    user = await prisma.user.create({
      data: {
        clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.firstName ?? "",
        lastname: clerkUser.lastName ?? "",
        role: expectedRole,
        tenantId,
      },
      select: { id: true, role: true, name: true, isActive: true, tenantId: true },
    });
  } else if (user.role === "OPERATOR" && expectedRole === "SUPERVISOR") {
    // Fix existing users that were auto-created with wrong role
    const tenantId = orgId && !user.tenantId ? await upsertTenant(orgId) : user.tenantId;
    user = await prisma.user.update({
      where: { clerkUserId },
      data: { role: "SUPERVISOR", tenantId },
      select: { id: true, role: true, name: true, isActive: true, tenantId: true },
    });
  } else if (orgId && !user.tenantId) {
    // User has correct role but missing tenant link
    const tenantId = await upsertTenant(orgId);
    user = await prisma.user.update({
      where: { clerkUserId },
      data: { tenantId },
      select: { id: true, role: true, name: true, isActive: true, tenantId: true },
    });
  }

  return { ...user, clerkUserId };
}

/**
 * Resolves the current Clerk session to our DB user + tenant context.
 * Call this at the top of every API route handler.
 * Throws if unauthenticated or the user is inactive.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const user = await ensureDbUser();

  if (!user.isActive) {
    throw new AuthError("User is inactive");
  }

  return {
    clerkUserId: user.clerkUserId,
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  };
}

/**
 * Asserts that the context has a tenantId (i.e. not a system admin without org).
 * Use in all tenant-scoped API routes.
 */
export function requireTenant(ctx: RequestContext): asserts ctx is RequestContext & { tenantId: number } {
  if (ctx.tenantId === null) {
    throw new AuthError("No tenant associated with this user");
  }
}

/**
 * Asserts that the user has one of the required roles.
 */
export function requireRole(ctx: RequestContext, ...roles: Role[]): void {
  if (!roles.includes(ctx.role)) {
    throw new ForbiddenError(`Required role: ${roles.join(" or ")}`);
  }
}

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Wraps an API handler to catch AuthError / ForbiddenError and return proper HTTP responses.
 */
export function withAuth<T>(
  handler: (ctx: RequestContext) => Promise<T>
): () => Promise<Response> {
  return async () => {
    try {
      const ctx = await getRequestContext();
      const result = await handler(ctx);
      return Response.json(result);
    } catch (err) {
      if (err instanceof AuthError) {
        return Response.json({ error: err.message }, { status: 401 });
      }
      if (err instanceof ForbiddenError) {
        return Response.json({ error: err.message }, { status: 403 });
      }
      console.error("[API Error]", err);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
