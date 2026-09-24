import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building2, Plus, CheckCircle2 } from "lucide-react";
import { Page, PageHeader, Card, Badge, EmptyState, Alert, buttonStyles, table, formatDate } from "@/components/dashboard/ui";

export default async function TenantsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const { created } = await searchParams;

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, code: true, industry: true,
      isActive: true, plan: true, createdAt: true,
      _count: { select: { users: true, events: true } },
    },
  });

  return (
    <Page>
      <PageHeader
        title="Empresas"
        description={`${tenants.length} empresa${tenants.length !== 1 ? "s" : ""} en la plataforma.`}
        actions={
          <Link href="/dashboard/tenants/create" className={buttonStyles.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva empresa
          </Link>
        }
      />

      {created && (
        <Alert tone="success" icon={CheckCircle2}>
          Empresa creada. El siguiente paso es invitar a su supervisor.
        </Alert>
      )}

      <Card>
        {tenants.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Todavía no hay empresas"
            description="Cada empresa es un espacio separado con sus supervisores, operadores y conocimiento."
            action={<Link href="/dashboard/tenants/create" className={buttonStyles.secondary}>Crear la primera</Link>}
          />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Empresa</th>
                  <th className={table.th}>Industria</th>
                  <th className={table.th}>Plan</th>
                  <th className={table.th}>Usuarios</th>
                  <th className={table.th}>Eventos</th>
                  <th className={table.th}>Estado</th>
                  <th className={table.th}>Alta</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className={table.tr}>
                    <td className={table.td}>
                      <p className="font-medium text-fg">{tenant.name}</p>
                      <p className="font-mono text-xs text-fg-subtle">{tenant.code}</p>
                    </td>
                    <td className={table.td}>{tenant.industry ?? "-"}</td>
                    <td className={table.td}>
                      <Badge tone="brand">
                        <span className="capitalize">{tenant.plan.toLowerCase()}</span>
                      </Badge>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{tenant._count.users}</td>
                    <td className={`${table.td} tabular-nums`}>{tenant._count.events}</td>
                    <td className={table.td}>
                      <Badge tone={tenant.isActive ? "success" : "neutral"}>{tenant.isActive ? "Activa" : "Inactiva"}</Badge>
                    </td>
                    <td className={table.td}>{formatDate(tenant.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Page>
  );
}
