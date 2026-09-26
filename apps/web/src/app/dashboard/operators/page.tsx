import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserCircle, UserPlus, CheckCircle2 } from "lucide-react";
import { Page, PageHeader, Card, Badge, EmptyState, Alert, Avatar, buttonStyles, table, formatDate } from "@/components/dashboard/ui";

function formatPhone(phone: string | null) {
  if (!phone) return "-";
  return `+${phone}`;
}

export default async function OperatorsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");

  const { created } = await searchParams;

  const operators = await prisma.user.findMany({
    where: { tenantId: user.tenantId, role: "OPERATOR" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, lastname: true, phoneNumber: true,
      isActive: true, department: true, createdAt: true,
    },
  });

  return (
    <Page>
      <PageHeader
        title="Operadores"
        description={`${operators.length} operador${operators.length !== 1 ? "es" : ""}. Reportan incidentes desde su WhatsApp.`}
        actions={
          <Link href="/dashboard/operators/create" className={buttonStyles.hero}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Nuevo operador
          </Link>
        }
      />

      {created && (
        <Alert tone="success" icon={CheckCircle2}>
          Operador registrado. Ya puede escribirle al asistente desde su WhatsApp.
        </Alert>
      )}

      <Card>
        {operators.length === 0 ? (
          <EmptyState
            icon={UserCircle}
            title="Todavía no hay operadores"
            description="Registrá el WhatsApp de cada técnico. No tienen que instalar nada: le escriben al asistente y listo."
            action={<Link href="/dashboard/operators/create" className={buttonStyles.secondary}>Registrar operador</Link>}
          />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Nombre</th>
                  <th className={table.th}>WhatsApp</th>
                  <th className={table.th}>Área</th>
                  <th className={table.th}>Estado</th>
                  <th className={table.th}>Alta</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((op) => {
                  const fullName = `${op.name} ${op.lastname}`.trim();
                  return (
                    <tr key={op.id} className={table.tr}>
                      <td className={table.td}>
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} />
                          <span className="font-medium text-fg">{fullName}</span>
                        </div>
                      </td>
                      <td className={`${table.td} font-mono text-[13px] tabular-nums`}>{formatPhone(op.phoneNumber)}</td>
                      <td className={table.td}>{op.department ?? "-"}</td>
                      <td className={table.td}>
                        <Badge tone={op.isActive ? "success" : "neutral"}>{op.isActive ? "Activo" : "Inactivo"}</Badge>
                      </td>
                      <td className={table.td}>{formatDate(op.createdAt)}</td>
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
