import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, Inbox, BookOpen } from "lucide-react";
import {
  Page, PageHeader, Card, CardHeader, StatGroup, Stat, EmptyState, Badge, table,
} from "@/components/dashboard/ui";
import { BreakdownBars, TrendBars, type BarDatum } from "@/components/dashboard/charts";
import { EVENT_PRIORITY } from "@/components/dashboard/event-meta";

const WEEKS = 8;
const DAY_MS = 86_400_000;

// Severity order + bar colors (saturated token hues). Labels are always shown, so color is
// never the sole carrier of identity.
const PRIORITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const PRIORITY_BAR: Record<string, string> = {
  CRITICAL: "#B42626",
  HIGH: "#E0533A",
  MEDIUM: "#D98A06",
  LOW: "#9A9EB0",
};

export default async function KpisPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");
  const tenantId = user.tenantId;

  const since = windowStart();

  const [statusGroups, priorityGroups, escalatedCount, topMachines, resolvedEvents, windowEvents, kbAgg, topKb] =
    await Promise.all([
      prisma.event.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
      prisma.event.groupBy({ by: ["priority"], where: { tenantId }, _count: true }),
      prisma.event.count({ where: { tenantId, escalatedAt: { not: null } } }),
      prisma.event.groupBy({
        by: ["machineName"],
        where: { tenantId, machineName: { not: null } },
        _count: { machineName: true },
        orderBy: { _count: { machineName: "desc" } },
        take: 6,
      }),
      prisma.event.findMany({
        where: { tenantId, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.event.findMany({
        where: { tenantId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.knowledgeBase.aggregate({
        where: { tenantId },
        _count: true,
        _avg: { effectivenessScore: true },
        _sum: { timesReferenced: true },
      }),
      prisma.knowledgeBase.findMany({
        where: { tenantId },
        orderBy: { timesReferenced: "desc" },
        take: 5,
        select: { id: true, problemText: true, timesReferenced: true, effectivenessScore: true },
      }),
    ]);

  const statusCount = (s: string) => statusGroups.find((g) => g.status === s)?._count ?? 0;
  const total = statusGroups.reduce((acc, g) => acc + g._count, 0);
  const resolved = statusCount("RESOLVED");
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const escalationRate = total > 0 ? Math.round((escalatedCount / total) * 100) : 0;

  // Average time-to-resolve, computed in JS (pilot-scale data). Revisit with a SQL
  // aggregate if the resolved-event count grows large.
  const avgTtrSeconds =
    resolvedEvents.length > 0
      ? resolvedEvents.reduce((acc, e) => acc + (e.resolvedAt!.getTime() - e.createdAt.getTime()) / 1000, 0) /
        resolvedEvents.length
      : null;

  const trend = buildTrend(windowEvents);

  const priorityData: BarDatum[] = PRIORITY_ORDER.map((p) => {
    const value = priorityGroups.find((g) => g.priority === p)?._count ?? 0;
    return {
      label: EVENT_PRIORITY[p].label,
      value,
      color: PRIORITY_BAR[p],
      caption: total > 0 ? `${Math.round((value / total) * 100)}%` : undefined,
    };
  });

  const machineData: BarDatum[] = topMachines.map((m) => ({
    label: m.machineName ?? "—",
    value: m._count.machineName,
  }));

  const kbCount = kbAgg._count;
  const kbAvgEffectiveness = kbAgg._avg.effectivenessScore;
  const kbTotalReferences = kbAgg._sum.timesReferenced ?? 0;

  return (
    <Page>
      <PageHeader
        title="KPIs"
        description="Indicadores del piloto: volumen de incidentes, resolución y uso del conocimiento."
      />

      <StatGroup className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Eventos totales" value={total} icon={Inbox} tone="brand" hint="Desde el inicio" href="/dashboard/events" />
        <Stat
          label="Tasa de resolución"
          value={`${resolutionRate}%`}
          icon={CheckCircle2}
          tone="success"
          hint={`${resolved} de ${total} resueltos`}
        />
        <Stat
          label="Tiempo medio de resolución"
          value={formatDuration(avgTtrSeconds)}
          icon={Clock}
          tone="info"
          hint={resolvedEvents.length > 0 ? `Sobre ${resolvedEvents.length} resueltos` : "Sin datos todavía"}
        />
        <Stat
          label="Escalados"
          value={escalatedCount}
          icon={AlertTriangle}
          tone="danger"
          hint={total > 0 ? `${escalationRate}% de los eventos` : "Sin datos todavía"}
        />
      </StatGroup>

      <Card className="mt-6">
        <CardHeader title="Incidentes por semana" description="Últimas 8 semanas" />
        <div className="px-5 py-5">
          {total === 0 ? (
            <EmptyState icon={BarChart3} title="Sin datos todavía" description="Cuando lleguen incidentes por WhatsApp, vas a ver la tendencia acá." />
          ) : (
            <TrendBars data={trend} ariaLabel="Incidentes por semana, últimas 8 semanas" />
          )}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Por prioridad" description="Distribución de todos los eventos" />
          <div className="px-5 py-5">
            {total === 0 ? (
              <EmptyState icon={Inbox} title="Sin eventos todavía" />
            ) : (
              <BreakdownBars data={priorityData} ariaLabel="Eventos por prioridad" />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Máquinas con más incidentes" description="Top 6 por cantidad de eventos" />
          <div className="px-5 py-5">
            {machineData.length === 0 ? (
              <EmptyState icon={Inbox} title="Sin máquinas registradas" description="El agente completa la máquina cuando el operador la menciona." />
            ) : (
              <BreakdownBars data={machineData} ariaLabel="Máquinas con más incidentes" />
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Base de conocimiento"
          description="Casos resueltos que el agente reutiliza para responder más rápido."
        />
        <dl className="grid grid-cols-1 divide-y divide-line-subtle border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { label: "Casos", value: kbCount },
            { label: "Efectividad promedio", value: kbAvgEffectiveness != null ? `${kbAvgEffectiveness.toFixed(1)}/10` : "—" },
            { label: "Veces consultada", value: kbTotalReferences },
          ].map((s) => (
            <div key={s.label} className="px-5 py-4">
              <dt className="text-[13px] text-fg-subtle">{s.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
        {topKb.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Todavía no hay casos"
            description="Cada incidente resuelto por WhatsApp suma un caso que el agente puede reutilizar."
          />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Caso (problema)</th>
                  <th className={table.th}>Veces usada</th>
                  <th className={table.th}>Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {topKb.map((k) => (
                  <tr key={k.id} className={table.tr}>
                    <td className={table.td}>
                      <span className="block max-w-md truncate text-fg" title={k.problemText}>{k.problemText}</span>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{k.timesReferenced}</td>
                    <td className={table.td}>
                      <Badge tone={k.effectivenessScore >= 7 ? "success" : k.effectivenessScore >= 4 ? "warning" : "neutral"}>
                        {k.effectivenessScore}/10
                      </Badge>
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

// Clock reads live in plain helpers (not the component body) so the render stays pure.
function windowStart(): Date {
  return new Date(Date.now() - WEEKS * 7 * DAY_MS);
}

// Rolling 8-week trend (oldest → newest), bucketed into 7-day windows ending today.
function buildTrend(windowEvents: { createdAt: Date }[]): BarDatum[] {
  const now = Date.now();
  const buckets = Array.from({ length: WEEKS }, () => 0);
  for (const e of windowEvents) {
    const wi = Math.floor((now - e.createdAt.getTime()) / DAY_MS / 7);
    if (wi >= 0 && wi < WEEKS) buckets[wi]++;
  }
  const trend: BarDatum[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = new Date(now - i * 7 * DAY_MS - 6 * DAY_MS);
    trend.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, value: buckets[i] });
  }
  return trend;
}

function formatDuration(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds) || seconds <= 0) return "—";
  const min = seconds / 60;
  if (min < 60) return `${Math.round(min)} min`;
  const h = min / 60;
  if (h < 24) return `${h < 10 ? h.toFixed(1) : Math.round(h)} h`;
  const d = h / 24;
  return `${d < 10 ? d.toFixed(1) : Math.round(d)} d`;
}
