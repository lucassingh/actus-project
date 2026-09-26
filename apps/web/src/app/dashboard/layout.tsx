import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ensureDbUser, AuthError } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { getOrgLogos } from "@/lib/org-logos";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await ensureDbUser();
  } catch (err) {
    if (err instanceof AuthError) redirect("/sign-in");
    throw err;
  }

  if (!user.isActive) redirect("/sign-in");

  const isAdmin = user.role === "ADMIN";
  const [clerkUser, tenant] = await Promise.all([
    currentUser(),
    // A platform admin can be a member of an org they created; their workspace is still Actus.
    !isAdmin && user.tenantId
      ? prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true, clerkOrgId: true } })
      : null,
  ]);
  const logos = tenant ? await getOrgLogos([tenant.clerkOrgId]) : {};

  const displayName =
    clerkUser?.fullName || user.name || clerkUser?.primaryEmailAddress?.emailAddress || "Usuario";

  return (
    <DashboardShell
      user={{
        role: user.role,
        displayName,
        workspace: isAdmin ? "Actus" : (tenant?.name ?? "Actus"),
        workspaceLogo: isAdmin ? "/logos/isologo-light.svg" : tenant ? logos[tenant.clerkOrgId] : null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
