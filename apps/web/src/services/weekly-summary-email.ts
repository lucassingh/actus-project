// Pure rendering of the weekly summary email — no DB/Resend imports, so it's unit-testable.
// Email HTML needs inline styles (clients strip <style>), so everything is inlined.

export interface WeeklySummary {
  tenantName: string;
  periodLabel: string; // e.g. "29/9 – 5/10"
  newIncidents: number;
  resolved: number;
  escalated: number;
  openNow: number;
  avgTtrLabel: string; // "—" when no resolutions
  newKbCount: number;
  topMachines: { name: string; count: number }[];
}

/** Whether the week had anything worth emailing about (skip quiet weeks). */
export function hasActivity(s: WeeklySummary): boolean {
  return s.newIncidents > 0 || s.resolved > 0 || s.escalated > 0;
}

export function formatDurationShort(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds) || seconds <= 0) return "—";
  const min = seconds / 60;
  if (min < 60) return `${Math.round(min)} min`;
  const h = min / 60;
  if (h < 24) return `${h < 10 ? h.toFixed(1) : Math.round(h)} h`;
  const d = h / 24;
  return `${d < 10 ? d.toFixed(1) : Math.round(d)} d`;
}

const NAVY = "#15183A";
const INK = "#23262F";
const MUTED = "#6B7084";
const LINE = "#E6E7EE";

function statCell(label: string, value: string | number): string {
  return `
    <td style="padding:14px 16px;border:1px solid ${LINE};border-radius:8px;background:#FAFAFB;" align="center">
      <div style="font-size:26px;font-weight:700;color:${INK};line-height:1;">${value}</div>
      <div style="font-size:12px;color:${MUTED};margin-top:6px;">${label}</div>
    </td>`;
}

export function renderWeeklySummaryEmail(s: WeeklySummary): { subject: string; html: string } {
  const subject = `Resumen semanal — ${s.tenantName}`;

  const machinesRows =
    s.topMachines.length > 0
      ? s.topMachines
          .map(
            (m) =>
              `<tr><td style="padding:6px 0;color:${INK};font-size:14px;">${escapeHtml(m.name)}</td>` +
              `<td align="right" style="padding:6px 0;color:${MUTED};font-size:14px;font-variant-numeric:tabular-nums;">${m.count}</td></tr>`
          )
          .join("")
      : `<tr><td style="padding:6px 0;color:${MUTED};font-size:14px;">Sin máquinas registradas esta semana</td></tr>`;

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#F1F1F4;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr><td style="background:${NAVY};border-radius:12px 12px 0 0;padding:22px 24px;">
      <div style="color:#fff;font-size:17px;font-weight:600;">Resumen semanal</div>
      <div style="color:rgba(255,255,255,0.72);font-size:13px;margin-top:2px;">${escapeHtml(s.tenantName)} · ${escapeHtml(s.periodLabel)}</div>
    </td></tr>
    <tr><td style="background:#fff;border:1px solid ${LINE};border-top:0;border-radius:0 0 12px 12px;padding:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:8px;">
        <tr>${statCell("Nuevos", s.newIncidents)}${statCell("Resueltos", s.resolved)}</tr>
        <tr>${statCell("Escalados", s.escalated)}${statCell("Abiertos hoy", s.openNow)}</tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
        <tr>
          <td style="padding:10px 0;border-top:1px solid ${LINE};color:${MUTED};font-size:14px;">Tiempo medio de resolución</td>
          <td align="right" style="padding:10px 0;border-top:1px solid ${LINE};color:${INK};font-size:14px;font-weight:600;">${escapeHtml(s.avgTtrLabel)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-top:1px solid ${LINE};color:${MUTED};font-size:14px;">Nuevos casos en la base de conocimiento</td>
          <td align="right" style="padding:10px 0;border-top:1px solid ${LINE};color:${INK};font-size:14px;font-weight:600;">${s.newKbCount}</td>
        </tr>
      </table>

      <div style="margin-top:20px;font-size:13px;font-weight:600;color:${INK};">Máquinas con más incidentes</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
        ${machinesRows}
      </table>

      <div style="margin-top:24px;">
        <a href="https://actus-project-web.vercel.app/dashboard/kpis" style="display:inline-block;background:${NAVY};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px;">Ver el detalle en Actus</a>
      </div>
    </td></tr>
    <tr><td style="padding:16px 24px;color:${MUTED};font-size:11px;text-align:center;">Enviado automáticamente por Actus · resumen de los últimos 7 días</td></tr>
  </table>
  </body></html>`;

  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
