import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  type WeeklySummary,
  renderWeeklySummaryEmail,
  formatDurationShort,
  hasActivity,
} from "./weekly-summary-email";

const WINDOW_DAYS = 7;

function shortDate(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Aggregate the last 7 days of activity for a tenant. */
export async function buildWeeklySummary(tenantId: number): Promise<WeeklySummary | null> {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 86_400_000);

  const [tenant, newIncidents, resolved, escalated, openNow, newKbCount, resolvedEvents, machineGroups] =
    await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
      prisma.event.count({ where: { tenantId, createdAt: { gte: since } } }),
      prisma.event.count({ where: { tenantId, resolvedAt: { gte: since } } }),
      prisma.event.count({ where: { tenantId, escalatedAt: { gte: since } } }),
      prisma.event.count({ where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.knowledgeBase.count({ where: { tenantId, createdAt: { gte: since } } }),
      prisma.event.findMany({
        where: { tenantId, resolvedAt: { gte: since } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.event.groupBy({
        by: ["machineName"],
        where: { tenantId, machineName: { not: null }, createdAt: { gte: since } },
        _count: { machineName: true },
        orderBy: { _count: { machineName: "desc" } },
        take: 3,
      }),
    ]);

  if (!tenant) return null;

  const avgTtrSeconds =
    resolvedEvents.length > 0
      ? resolvedEvents.reduce((acc, e) => acc + (e.resolvedAt!.getTime() - e.createdAt.getTime()) / 1000, 0) /
        resolvedEvents.length
      : null;

  return {
    tenantName: tenant.name,
    periodLabel: `${shortDate(since)} – ${shortDate(now)}`,
    newIncidents,
    resolved,
    escalated,
    openNow,
    avgTtrLabel: formatDurationShort(avgTtrSeconds),
    newKbCount,
    topMachines: machineGroups.map((g) => ({ name: g.machineName ?? "—", count: g._count.machineName })),
  };
}

/**
 * Build and email the weekly summary to a tenant's supervisors. Returns how many emails were
 * sent. Skips quiet weeks (no new/resolved/escalated incidents) and tenants without supervisors.
 *
 * Delivery note: with the default `onboarding@resend.dev` sender, Resend only delivers to the
 * Resend account's own address until a domain is verified — same sandbox caveat as the contact
 * form. Once CONTACT_FROM_EMAIL points at a verified domain, supervisors receive it normally.
 */
export async function sendWeeklySummaryForTenant(tenantId: number): Promise<number> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[weekly-summary] RESEND_API_KEY no configurada — se omite el envío");
    return 0;
  }

  const supervisors = await prisma.user.findMany({
    where: { tenantId, role: "SUPERVISOR", isActive: true },
    select: { email: true },
  });
  const recipients = supervisors.map((s) => s.email?.trim()).filter((e): e is string => !!e);
  if (recipients.length === 0) return 0;

  const summary = await buildWeeklySummary(tenantId);
  if (!summary || !hasActivity(summary)) return 0;

  const { subject, html } = renderWeeklySummaryEmail(summary);
  const from = process.env.CONTACT_FROM_EMAIL ?? "Actus <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  let sent = 0;
  for (const to of recipients) {
    try {
      const { error } = await resend.emails.send({ from, to, subject, html });
      if (error) {
        console.error("[weekly-summary] resend error", { to, error });
      } else {
        sent++;
      }
    } catch (err) {
      console.error("[weekly-summary] send failed", { to, err });
    }
  }
  return sent;
}
