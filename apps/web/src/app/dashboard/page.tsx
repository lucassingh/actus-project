import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Building2, Users, AlertCircle, Clock, CheckCircle2, BookOpen, UserCircle, FileText, Plus, ArrowRight, Inbox,
} from "lucide-react";
import {
  Page, PageHeader, Card, CardHeader, StatGroup, Stat, Badge, EmptyState, buttonStyles, table, formatDate,
} from "@/components/dashboard/ui";
import { EVENT_STATUS, EVENT_PRIORITY } from "@/components/dashboard/event-meta";

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const [user, clerkUser] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, name: true, email: true, role: true, tenantId: true },
    }),
    currentUser(),
  ]);
  if (!user) redirect("/sign-in");

  const firstName = clerkUser?.firstName || user.name || null;
  const greeting = firstName ? `Hola, ${firstName}` : "Hola";

  if (user.role === "ADMIN") return <AdminHome greeting={greeting} />;
  if (user.role === "SUPERVISOR" && user.tenantId) return <SupervisorHome greeting={greeting} tenantId={user.tenantId} />;
  redirect("/sign-in");
}

async function AdminHome({ greeting }: { greeting: string }) {
  const [tenantsCount, supervisorsCount, operatorsCount, tenants] = await Promise.all([
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "SUPERVISOR", isActive: true } }),
    prisma.user.count({ where: { role: "OPERATOR", isActive: true } }),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, name: true, code: true, isActive: true, createdAt: true,
        _count: { select: { users: true, events: true } },
      },
    }),
  ]);

  return (
    <Page>
      <PageHeader
        title={greeting}
        description="Resumen de la plataforma y de las empresas del piloto."
        actions={
          <Link href="/dashboard/tenants/create" className={buttonStyles.hero}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva empresa
          </Link>
        }
      />

      <StatGroup className="sm:grid-cols-3">
        <Stat label="Empresas activas" value={tenantsCount} icon={Building2} href="/dashboard/tenants" />
        <Stat label="Supervisores activos" value={supervisorsCount} icon={Users} href="/dashboard/supervisors" />
        <Stat label="Operadores registrados" value={operatorsCount} icon={UserCircle} hint="En todas las empresas" />
      </StatGroup>

      <Card className="mt-6">
        <CardHeader
          title="Empresas recientes"
          actions={
            <Link href="/dashboard/tenants" className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted hover:text-fg">
              Ver todas <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        />
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
                  <th className={table.th}>Usuarios</th>
                  <th className={table.th}>Eventos</th>
                  <th className={table.th}>Estado</th>
                  <th className={table.th}>Alta</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className={table.tr}>
                    <td className={table.td}>
                      <p className="font-medium text-fg">{t.name}</p>
                      <p className="font-mono text-xs text-fg-subtle">{t.code}</p>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{t._count.users}</td>
                    <td className={`${table.td} tabular-nums`}>{t._count.events}</td>
                    <td className={table.td}>
                      <Badge tone={t.isActive ? "success" : "neutral"}>{t.isActive ? "Activa" : "Inactiva"}</Badge>
                    </td>
                    <td className={table.td}>{formatDate(t.createdAt)}</td>
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

async function SupervisorHome({ greeting, tenantId }: { greeting: string; tenantId: number }) {
  const [totals, operatorsCount, kbCount, docsCount, recent] = await Promise.all([
    prisma.event.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
    prisma.user.count({ where: { tenantId, role: "OPERATOR", isActive: true } }),
    prisma.knowledgeBase.count({ where: { tenantId } }),
    prisma.factoryDoc.count({ where: { tenantId } }),
    prisma.event.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, title: true, status: true, priority: true, machineName: true, createdAt: true,
        creator: { select: { name: true, lastname: true } },
      },
    }),
  ]);

  const count = (s: string) => totals.find((g) => g.status === s)?._count ?? 0;
  const total = totals.reduce((acc, g) => acc + g._count, 0);

  return (
    <Page>
      <PageHeader
        title={greeting}
        description="Lo que está pasando hoy en la planta."
        actions={
          <Link href="/dashboard/operators/create" className={buttonStyles.hero}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo operador
          </Link>
        }
      />

      <StatGroup className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Abiertos" value={count("OPEN")} icon={AlertCircle} hint="Esperando atención" href="/dashboard/events?status=OPEN" />
        <Stat label="En progreso" value={count("IN_PROGRESS")} icon={Clock} hint="Siendo atendidos" href="/dashboard/events?status=IN_PROGRESS" />
        <Stat label="Resueltos" value={count("RESOLVED")} icon={CheckCircle2} hint="Con solución confirmada" href="/dashboard/events?status=RESOLVED" />
        <Stat label="Eventos totales" value={total} icon={Inbox} href="/dashboard/events" />
      </StatGroup>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Eventos recientes"
            actions={
              <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-muted hover:text-fg">
                Ver todos <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />
          {recent.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Sin eventos todavía"
              description="Cuando un operador reporte algo por WhatsApp, el incidente aparece acá."
            />
          ) : (
            <ul>
              {recent.map((e) => {
                const status = EVENT_STATUS[e.status] ?? EVENT_STATUS.OPEN;
                const priority = EVENT_PRIORITY[e.priority] ?? EVENT_PRIORITY.MEDIUM;
                return (
                  <li key={e.id} className="border-b border-line-subtle last:border-0">
                    <Link
                      href={`/dashboard/events/${e.id}`}
                      className="flex items-center gap-4 px-5 py-3 transition-colors duration-150 hover:bg-[#FAFAFB]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">{e.title}</p>
                        <p className="mt-0.5 flex gap-x-3 truncate text-xs text-fg-subtle">
                          <span>{e.creator.name} {e.creator.lastname}</span>
                          {e.machineName && <span>{e.machineName}</span>}
                          <span>{formatDate(e.createdAt, true)}</span>
                        </p>
                      </div>
                      <Badge tone={priority.tone}>{priority.label}</Badge>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Tu planta" description="Equipo y conocimiento disponible para el agente." />
          <dl className="divide-y divide-line-subtle">
            {[
              { label: "Operadores activos", value: operatorsCount, icon: UserCircle, href: "/dashboard/operators" },
              { label: "Casos en la base de conocimiento", value: kbCount, icon: BookOpen, href: "/dashboard/knowledge-base" },
              { label: "Documentos indexados", value: docsCount, icon: FileText, href: "/dashboard/factory-docs" },
            ].map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-[#FAFAFB]"
              >
                <row.icon className="h-4 w-4 text-fg-subtle" strokeWidth={1.75} aria-hidden="true" />
                <dt className="flex-1 text-sm text-fg-muted">{row.label}</dt>
                <dd className="text-sm font-semibold tabular-nums text-fg">{row.value}</dd>
              </Link>
            ))}
          </dl>
        </Card>
      </div>
    </Page>
  );
}
