import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ensureDbUser, AuthError } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await ensureDbUser();
  } catch (err) {
    if (err instanceof AuthError) redirect("/sign-in");
    throw err;
  }

  if (!user.isActive) redirect("/sign-in");

  const [clerkUser, tenant] = await Promise.all([
    currentUser(),
    user.tenantId ? prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true } }) : null,
  ]);

  const displayName =
    clerkUser?.fullName || user.name || clerkUser?.primaryEmailAddress?.emailAddress || "Usuario";

  return (
    <DashboardShell
      user={{
        role: user.role,
        displayName,
        workspace: tenant?.name ?? "Actus",
      }}
    >
      {children}
    </DashboardShell>
  );
}
