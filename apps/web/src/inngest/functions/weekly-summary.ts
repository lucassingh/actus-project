import * as Sentry from "@sentry/nextjs";
import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { sendWeeklySummaryForTenant } from "@/services/weekly-summary.service";

/**
 * Weekly plant summary, emailed to each tenant's supervisors every Monday 08:00 (Argentina).
 * One durable step per tenant so a Resend hiccup for one tenant doesn't drop the rest, and a
 * retry re-sends only the tenant that failed. Quiet weeks and supervisor-less tenants are
 * skipped inside the service. You can also run it on demand from the Inngest dashboard.
 */
export const weeklySummary = inngest.createFunction(
  {
    id: "weekly-summary",
    retries: 2,
    triggers: [{ cron: "TZ=America/Argentina/Buenos_Aires 0 8 * * 1" }],
    onFailure: async ({ error }) => {
      Sentry.captureException(error, { tags: { flow: "weekly-summary" } });
      console.error("[weekly-summary] run failed after retries", error?.message);
    },
  },
  async ({ step }) => {
    const tenants = await step.run("load-tenants", () =>
      prisma.tenant.findMany({ where: { isActive: true }, select: { id: true } })
    );

    let emailsSent = 0;
    for (const t of tenants) {
      emailsSent += await step.run(`summary-${t.id}`, () => sendWeeklySummaryForTenant(t.id));
    }

    return { tenants: tenants.length, emailsSent };
  }
);
