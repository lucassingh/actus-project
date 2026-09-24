import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, UserPlus, CheckCircle2 } from "lucide-react";
import { Page, PageHeader, Card, Badge, EmptyState, Alert, Avatar, buttonStyles, table, formatDate } from "@/components/dashboard/ui";

export default async function SupervisorsPage({ searchParams }: { searchParams: Promise<{ invited?: string }> }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  if (!isActusAdmin) redirect("/dashboard");

  const { invited } = await searchParams;

  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISOR" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, lastname: true, email: true,
      isActive: true, lastLoginAt: true, createdAt: true,
      tenant: { select: { name: true } },
    },
  });

  return (
    <Page>
      <PageHeader
        title="Supervisores"
        description={`${supervisors.length} supervisor${supervisors.length !== 1 ? "es" : ""}. Cada uno administra una empresa.`}
        actions={
          <Link href="/dashboard/supervisors/create" className={buttonStyles.primary}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invitar supervisor
          </Link>
        }
      />

      {invited && (
        <Alert tone="success" icon={CheckCircle2}>
          Invitación enviada. El supervisor aparece acá cuando la acepte y entre por primera vez.
        </Alert>
      )}

      <Card>
        {supervisors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Todavía no hay supervisores"
            description="Invitá al responsable de mantenimiento de cada empresa. Él después suma a sus operadores."
            action={<Link href="/dashboard/supervisors/create" className={buttonStyles.secondary}>Invitar supervisor</Link>}
          />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Nombre</th>
                  <th className={table.th}>Email</th>
                  <th className={table.th}>Empresa</th>
                  <th className={table.th}>Estado</th>
                  <th className={table.th}>Último acceso</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((sup) => {
                  const fullName = `${sup.name} ${sup.lastname}`.trim() || sup.email;
                  return (
                    <tr key={sup.id} className={table.tr}>
                      <td className={table.td}>
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} />
                          <span className="font-medium text-fg">{fullName}</span>
                        </div>
                      </td>
                      <td className={table.td}>{sup.email}</td>
                      <td className={table.td}>{sup.tenant?.name ?? "-"}</td>
                      <td className={table.td}>
                        <Badge tone={sup.isActive ? "success" : "neutral"}>{sup.isActive ? "Activo" : "Inactivo"}</Badge>
                      </td>
                      <td className={table.td}>{sup.lastLoginAt ? formatDate(sup.lastLoginAt) : "Nunca"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Page>
  );
}
