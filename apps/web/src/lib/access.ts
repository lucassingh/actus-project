import type { Role } from "@prisma/client";

export interface AccessUser {
  role: Role;
  tenantId: number | null;
  isActive: boolean;
}

/**
 * Who gets a workspace in the dashboard: platform admins, and supervisors linked to a company.
 * Everyone else who signs in (an uninvited account, an operator, a deactivated user) has nothing
 * to show and goes to /sin-acceso — never back to /sign-in, which bounces an active session home.
 */
export function hasDashboardAccess(user: AccessUser): boolean {
  if (!user.isActive) return false;
  if (user.role === "ADMIN") return true;
  return user.role === "SUPERVISOR" && user.tenantId !== null;
}
