import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/dashboard/EventCard";
import { EventsFilters } from "@/components/dashboard/EventsFilters";
import { Inbox, SearchX } from "lucide-react";
import { Page, PageHeader, Card, EmptyState } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import type { EventStatus, Priority, EventType } from "@actus/types";

interface SearchParams {
  status?: EventStatus;
  priority?: Priority;
  eventType?: EventType;
  page?: string;
}

const LIMIT = 10;

export default async function EventsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true, tenantId: true },
  });
  if (!user || !user.tenantId) redirect("/sign-in");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * LIMIT;
  const filtered = !!(params.status || params.priority || params.eventType);

  const where = {
    tenantId: user.tenantId,
    ...(params.status && { status: params.status }),
    ...(params.priority && { priority: params.priority }),
    ...(params.eventType && { eventType: params.eventType }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        eventType: true,
        status: true,
        priority: true,
        contentType: true,
        machineName: true,
        location: true,
        createdAt: true,
        resolvedAt: true,
        creator: { select: { id: true, name: true, lastname: true } },
      },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      skip: offset,
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  // Serialize dates for client components
  const serializedEvents = events.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    resolvedAt: e.resolvedAt?.toISOString() ?? null,
  }));

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.priority) qs.set("priority", params.priority);
    if (params.eventType) qs.set("eventType", params.eventType);
    qs.set("page", String(p));
    return `?${qs.toString()}`;
  };

  return (
    <Page>
      <PageHeader
        title="Eventos"
        description="Incidentes, mantenimientos y controles reportados por los operadores."
      />

      <Card>
        <EventsFilters />

        {events.length === 0 ? (
          filtered ? (
            <EmptyState icon={SearchX} title="Ningún evento coincide con los filtros" description="Probá con otra combinación o limpiá los filtros." />
          ) : (
            <EmptyState
              icon={Inbox}
              title="Sin eventos todavía"
              description="Cuando un operador reporte algo por WhatsApp, el incidente aparece acá con toda la conversación."
            />
          )
        ) : (
          <>
            <ul>
              {serializedEvents.map((event) => (
                <EventCard key={event.id} event={event as never} />
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <p className="text-[13px] text-fg-subtle">
                {offset + 1}-{offset + events.length} de {total}
              </p>
              {totalPages > 1 && (
                <nav aria-label="Paginación" className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={pageHref(p)}
                      aria-current={p === page ? "page" : undefined}
                      className={cn(
                        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] tabular-nums transition-colors duration-150",
                        p === page ? "border border-line bg-white font-medium text-fg" : "text-fg-subtle hover:bg-[#F1F1F4] hover:text-fg"
                      )}
                    >
                      {p}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </>
        )}
      </Card>
    </Page>
  );
}
