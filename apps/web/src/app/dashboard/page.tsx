import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  Building2, Users, AlertCircle, Clock, CheckCircle, FileText, BookOpen, UserCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, name: true, email: true, role: true, tenantId: true },
  });
  if (!user) redirect("/sign-in");

  const isAdmin = user.role === "ADMIN";
  const isSupervisor = user.role === "SUPERVISOR";

  // Admin stats
  let tenantsCount = 0;
  let supervisorsCount = 0;

  // Supervisor stats
  let totalEvents = 0;
  let openEvents = 0;
  let inProgressEvents = 0;
  let resolvedEvents = 0;
  let operatorsCount = 0;
  let knowledgeEntries = 0;

  if (isAdmin) {
    [tenantsCount, supervisorsCount] = await Promise.all([
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "SUPERVISOR", isActive: true } }),
    ]);
  }

  if (isSupervisor && user.tenantId) {
    const [totals, operators, kb] = await Promise.all([
      prisma.event.groupBy({
        by: ["status"],
        where: { tenantId: user.tenantId },
        _count: true,
      }),
      prisma.user.count({ where: { tenantId: user.tenantId, role: "OPERATOR", isActive: true } }),
      prisma.knowledgeBase.count({ where: { tenantId: user.tenantId } }),
    ]);

    for (const g of totals) {
      totalEvents += g._count;
      if (g.status === "OPEN") openEvents = g._count;
      if (g.status === "IN_PROGRESS") inProgressEvents = g._count;
      if (g.status === "RESOLVED") resolvedEvents = g._count;
    }
    operatorsCount = operators;
    knowledgeEntries = kb;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">
            Bienvenido, {user.name || user.email}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {user.role === "ADMIN" ? "Administrador" : user.role === "SUPERVISOR" ? "Supervisor" : "Operador"}
          </p>
        </div>
      </div>

      {/* Admin KPIs */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KPICard
            title="Empresas"
            value={tenantsCount}
            subtitle="Total de empresas activas"
            icon={Building2}
            iconColor="#3a55b4"
            gradient="linear-gradient(135deg, #3a55b420, #81de7620)"
          />
          <KPICard
            title="Supervisores"
            value={supervisorsCount}
            subtitle="Total de supervisores activos"
            icon={Users}
            iconColor="#81de76"
            gradient="linear-gradient(135deg, #81de7620, #3a55b420)"
          />
        </div>
      )}

      {/* Supervisor KPIs */}
      {isSupervisor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Eventos Totales"
            value={totalEvents}
            subtitle="Total registrados"
            icon={AlertCircle}
            iconColor="#3a55b4"
            gradient="linear-gradient(135deg, #3a55b420, #81de7620)"
          />
          <KPICard
            title="Abiertos"
            value={openEvents}
            subtitle="Pendientes de atención"
            icon={Clock}
            iconColor="#ff9800"
            gradient="linear-gradient(135deg, #ff980020, #ff572220)"
          />
          <KPICard
            title="En Progreso"
            value={inProgressEvents}
            subtitle="Siendo atendidos"
            icon={FileText}
            iconColor="#2196f3"
            gradient="linear-gradient(135deg, #2196f320, #03a9f420)"
          />
          <KPICard
            title="Resueltos"
            value={resolvedEvents}
            subtitle="Solución confirmada"
            icon={CheckCircle}
            iconColor="#4caf50"
            gradient="linear-gradient(135deg, #4caf5020, #8bc34a20)"
          />

          <div className="sm:col-span-2 xl:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              title="Operadores"
              value={operatorsCount}
              subtitle="Activos en tu empresa"
              icon={UserCircle}
              iconColor="#9c27b0"
              gradient="linear-gradient(135deg, #9c27b020, #e91e6320)"
            />
            <KPICard
              title="Base de Conocimiento"
              value={knowledgeEntries}
              subtitle="Incidentes documentados"
              icon={BookOpen}
              iconColor="#00bcd4"
              gradient="linear-gradient(135deg, #00bcd420, #00968820)"
            />
          </div>
        </div>
      )}
    </div>
  );
}
