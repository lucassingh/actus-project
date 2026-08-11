import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { Role } from "@prisma/client";

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

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkUserId, orgId, orgRole, sessionClaims } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  // Actus platform admins: set publicMetadata.actusAdmin = true in Clerk dashboard
  const isActusAdmin = (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  const expectedRole: Role = isActusAdmin ? "ADMIN" : orgRole === "org:member" ? "OPERATOR" : "SUPERVISOR";

  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, name: true, isActive: true, tenantId: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

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
      select: { role: true, name: true, isActive: true, tenantId: true },
    });
  } else if (user.role === "OPERATOR" && expectedRole === "SUPERVISOR") {
    // Fix existing users that were auto-created with wrong role
    const tenantId = orgId && !user.tenantId ? await upsertTenant(orgId) : user.tenantId;
    user = await prisma.user.update({
      where: { clerkUserId },
      data: { role: "SUPERVISOR", tenantId },
      select: { role: true, name: true, isActive: true, tenantId: true },
    });
  } else if (orgId && !user.tenantId) {
    // User has correct role but missing tenant link
    const tenantId = await upsertTenant(orgId);
    user = await prisma.user.update({
      where: { clerkUserId },
      data: { tenantId },
      select: { role: true, name: true, isActive: true, tenantId: true },
    });
  }

  if (!user.isActive) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
