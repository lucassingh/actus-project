import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookOpen, Clock, Cog } from "lucide-react";
import { Page, PageHeader, Card, EmptyState } from "@/components/dashboard/ui";

export default async function KnowledgeBasePage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || !user.tenantId) redirect("/sign-in");

  const entries = await prisma.knowledgeBase.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ timesReferenced: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, problemText: true, solutionText: true,
      effectivenessScore: true, timesReferenced: true,
      machineName: true, tags: true, timeToResolveMin: true, createdAt: true,
    },
    take: 50,
  });

  return (
    <Page>
      <PageHeader
        title="Base de conocimiento"
        description={`${entries.length} caso${entries.length !== 1 ? "s" : ""} resuelto${entries.length !== 1 ? "s" : ""}. El agente los usa para responder a los operadores.`}
      />

      <Card>
        {entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="La base de conocimiento está vacía"
            description="Se completa sola: cada incidente que un operador resuelve con el agente queda guardado acá."
          />
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id} className="border-b border-line-subtle px-5 py-4 last:border-0">
                <div className="flex items-start justify-between gap-6">
                  <p className="text-sm font-medium text-fg">{entry.problemText}</p>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-fg">
                      {entry.effectivenessScore}
                      <span className="font-normal text-fg-subtle">/10</span>
                    </p>
                    <p className="text-xs text-fg-subtle">efectividad</p>
                  </div>
                </div>

                <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-fg-muted">{entry.solutionText}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-subtle">
                  {entry.machineName && (
                    <span className="inline-flex items-center gap-1.5">
                      <Cog className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      {entry.machineName}
                    </span>
                  )}
                  {entry.timeToResolveMin != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      {entry.timeToResolveMin} min para resolver
                    </span>
                  )}
                  <span>Consultado {entry.timesReferenced} {entry.timesReferenced === 1 ? "vez" : "veces"}</span>
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-line px-1.5 py-0.5 text-fg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
