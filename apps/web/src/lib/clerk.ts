import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export interface RequestContext {
  clerkUserId: string;
  userId: number;
  tenantId: number | null;
  role: Role;
}

/**
 * Resolves the current Clerk session to our DB user + tenant context.
 * Call this at the top of every API route handler.
 * Throws if unauthenticated or user not found in DB.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new AuthError("Unauthenticated");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, tenantId: true, role: true },
  });

  if (!user) {
    throw new AuthError("User not found in database");
  }

  return {
    clerkUserId,
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
