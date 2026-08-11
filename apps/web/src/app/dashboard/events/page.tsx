import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/dashboard/EventCard";
import { EventsFilters } from "@/components/dashboard/EventsFilters";
import { AlertCircle } from "lucide-react";
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Eventos registrados</h1>
          <p className="text-white/80 text-sm mt-1">
            Gestiona y supervisa todos los eventos de tu empresa
          </p>
        </div>
      </div>

      <EventsFilters />

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay eventos registrados</p>
          <p className="text-gray-400 text-sm mt-1">
            {params.status || params.priority ? "Prueba cambiando los filtros" : "Aún no se han registrado eventos"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Mostrando {events.length} de {total} eventos
          </p>

          <div className="space-y-3">
            {serializedEvents.map((event) => (
              <EventCard key={event.id} event={event as never} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}${params.status ? `&status=${params.status}` : ""}${params.priority ? `&priority=${params.priority}` : ""}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    p === page
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={p === page ? { backgroundColor: "var(--primary)" } : {}}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
