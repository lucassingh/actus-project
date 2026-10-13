import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

interface DbUser {
  id: number;
  clerkUserId: string;
  role: Role;
  name: string;
  isActive: boolean;
  tenantId: number | null;
}

export async function upsertTenant(orgId: string): Promise<number> {
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
 * The session only carries the *active* organization. A supervisor who accepted the invitation
 * on another device, or whose session never set an org as active, has none: look the membership
 * up through the Backend API instead of treating them as uninvited.
 */
async function firstOrgMembership(clerkUserId: string): Promise<{ orgId: string; orgRole: string } | null> {
  try {
    const client = await clerkClient();
    const { data } = await client.users.getOrganizationMembershipList({ userId: clerkUserId, limit: 1 });
    const membership = data[0];
    return membership ? { orgId: membership.organization.id, orgRole: membership.role } : null;
  } catch {
    // Clerk unreachable: the user lands on /sin-acceso and can retry, instead of a 500.
    return null;
  }
}

/**
 * Resolves the current Clerk session to a DB User row, creating (or fixing) it
 * lazily on first request. Called by the dashboard layout on every page load.
 * Whether that row grants a workspace is a separate question: see hasDashboardAccess().
 */
export async function ensureDbUser(): Promise<DbUser> {
  const { userId: clerkUserId, orgId: activeOrgId, orgRole: activeOrgRole, sessionClaims } = await auth();
  if (!clerkUserId) {
    throw new AuthError("Unauthenticated");
  }

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;

  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true, name: true, isActive: true, tenantId: true },
  });

  // Only look memberships up when we would otherwise leave the user without a company.
  const org = activeOrgId
    ? { orgId: activeOrgId, orgRole: activeOrgRole }
    : !user || !user.tenantId
      ? await firstOrgMembership(clerkUserId)
      : null;
  const orgId = org?.orgId;
  const orgRole = org?.orgRole;

  const expectedRole: Role = isActusAdmin ? "ADMIN" : orgRole === "org:member" ? "OPERATOR" : "SUPERVISOR";

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
  } else if (user.role !== expectedRole) {
    // Role changed since last sync (e.g. actusAdmin flag added, or org membership changed)
    const tenantId = orgId && !user.tenantId ? await upsertTenant(orgId) : user.tenantId;
    user = await prisma.user.update({
      where: { clerkUserId },
      data: { role: expectedRole, tenantId },
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

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
