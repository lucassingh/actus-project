import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Cog, Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { Page, PageHeader, Card, CardHeader, Badge, Alert, EmptyState, buttonStyles, table, formatDate } from "@/components/dashboard/ui";

export default async function MachinesPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");

  const { deleted } = await searchParams;

  const machines = await prisma.machine.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      code: true,
      sector: true,
      isActive: true,
      createdAt: true,
      _count: { select: { events: true } },
    },
  });

  return (
    <Page>
      <PageHeader
        title="Máquinas"
        description="Los equipos de tu planta. Cada uno tiene un QR que abre WhatsApp con la máquina ya identificada."
        actions={
          <Link href="/dashboard/machines/create" className={buttonStyles.hero}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva máquina
          </Link>
        }
      />

      {deleted && <Alert tone="success" icon={CheckCircle2}>Máquina eliminada.</Alert>}

      <Card>
        <CardHeader title="Equipos" description={`${machines.length} cargad${machines.length === 1 ? "a" : "as"}`} />
        {machines.length === 0 ? (
          <EmptyState
            icon={Cog}
            title="Todavía no hay máquinas"
            description="Cargá tus equipos para generar los QR y que los incidentes queden vinculados a cada máquina."
            action={<Link href="/dashboard/machines/create" className={buttonStyles.secondary}>Cargar la primera</Link>}
          />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Código</th>
                  <th className={table.th}>Nombre</th>
                  <th className={table.th}>Sector</th>
                  <th className={table.th}>Eventos</th>
                  <th className={table.th}>Estado</th>
                  <th className={table.th}>Alta</th>
                  <th className={table.th}><span className="sr-only">Ver</span></th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m.id} className={table.tr}>
                    <td className={`${table.td} font-mono text-fg`}>
                      <Link href={`/dashboard/machines/${m.id}`} className="hover:underline">{m.code}</Link>
                    </td>
                    <td className={`${table.td} font-medium text-fg`}>{m.name}</td>
                    <td className={table.td}>{m.sector ?? "-"}</td>
                    <td className={`${table.td} tabular-nums`}>{m._count.events}</td>
                    <td className={table.td}>
                      <Badge tone={m.isActive ? "success" : "neutral"}>{m.isActive ? "Activa" : "Inactiva"}</Badge>
                    </td>
                    <td className={table.td}>{formatDate(m.createdAt)}</td>
                    <td className={`${table.td} text-right`}>
                      <Link href={`/dashboard/machines/${m.id}`} aria-label={`Ver ${m.name}`} className={buttonStyles.icon}>
                        <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                      </Link>
                    </td>
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
