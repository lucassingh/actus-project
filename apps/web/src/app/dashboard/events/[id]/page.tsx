import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Bot, MessageSquare, CheckCircle2 } from "lucide-react";
import type { ConversationHistory } from "@actus/types";
import { Page, Card, CardHeader, Badge, EmptyState, Avatar, formatDate } from "@/components/dashboard/ui";
import { EVENT_STATUS, EVENT_PRIORITY, EVENT_TYPE } from "@/components/dashboard/event-meta";
import { cn } from "@/lib/utils";

const MESSAGE_TYPE_LABEL: Record<string, string> = { audio: "Nota de voz", image: "Imagen" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const { id } = await params;
  const eventId = parseInt(id, 10);
  if (isNaN(eventId)) notFound();

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { tenantId: true, role: true },
  });
  if (!user || !user.tenantId) redirect("/sign-in");

  const event = await prisma.event.findFirst({
    where: { id: eventId, tenantId: user.tenantId },
    include: {
      creator: { select: { name: true, lastname: true, email: true } },
      assignee: { select: { name: true, lastname: true } },
    },
  });
  if (!event) notFound();

  const status = EVENT_STATUS[event.status] ?? EVENT_STATUS.OPEN;
  const priority = EVENT_PRIORITY[event.priority] ?? EVENT_PRIORITY.MEDIUM;
  const history = (event.conversationHistory as ConversationHistory | null)?.messages ?? [];
  const creatorName = `${event.creator.name} ${event.creator.lastname}`.trim();

  const details: [string, React.ReactNode][] = [
    ["Estado", <Badge key="s" tone={status.tone}>{status.label}</Badge>],
    ["Prioridad", <Badge key="p" tone={priority.tone}>{priority.label}</Badge>],
    ["Tipo", EVENT_TYPE[event.eventType] ?? event.eventType],
    ["Reportado por", creatorName],
    ["Asignado a", event.assignee ? `${event.assignee.name} ${event.assignee.lastname}` : "Sin asignar"],
    ["Máquina", event.machineName ?? "-"],
    ["Ubicación", event.location ?? "-"],
    ["Creado", formatDate(event.createdAt, true)],
    ["Resuelto", event.resolvedAt ? formatDate(event.resolvedAt, true) : "-"],
  ];

  return (
    <Page>
      <Link
        href="/dashboard/events"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-fg-subtle transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Eventos
      </Link>

      <div className="mb-8 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          <Badge tone={priority.tone}>{priority.label}</Badge>
          <span className="font-mono text-xs text-fg-subtle">#{event.id}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-fg">{event.title}</h1>
        {event.description && <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-fg-muted">{event.description}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {event.solution && (
            <Card className="border-[#BFE5CF]">
              <div className="flex gap-3 px-5 py-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1F9D57]" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-fg">Solución aplicada</p>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{event.solution}</p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Conversación con el agente"
              description={`${history.length} mensaje${history.length !== 1 ? "s" : ""} por WhatsApp`}
            />
            {history.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Sin conversación" description="Este evento no tiene mensajes registrados." />
            ) : (
              <ol className="flex max-h-[640px] flex-col gap-4 overflow-y-auto px-5 py-5">
                {history.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <li key={i} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                      {isUser ? (
                        <Avatar name={creatorName} size={28} />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                          <Bot className="h-3.5 w-3.5 text-white" strokeWidth={2} aria-hidden="true" />
                        </span>
                      )}
                      <div className={cn("max-w-[78%]", isUser && "text-right")}>
                        <p className="mb-1 text-xs text-fg-subtle">
                          <span className="font-medium text-fg-muted">{isUser ? creatorName : "Actus"}</span>{" "}
                          {new Date(msg.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <div
                          className={cn(
                            "inline-block rounded-lg border px-3.5 py-2.5 text-left text-sm leading-relaxed",
                            isUser ? "border-[#DCE0EE] bg-[#F3F5FB] text-fg" : "border-line bg-white text-fg-muted"
                          )}
                        >
                          {msg.type !== "text" && (
                            <span className="mb-1 block text-xs font-medium text-fg-subtle">
                              {MESSAGE_TYPE_LABEL[msg.type] ?? msg.type}
                            </span>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Detalles" />
            <dl className="divide-y divide-line-subtle">
              {details.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-5 py-2.5">
                  <dt className="text-[13px] text-fg-subtle">{label}</dt>
                  <dd className="truncate text-right text-[13px] text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {event.symptoms.length > 0 && (
            <Card>
              <CardHeader title="Síntomas" />
              <div className="flex flex-wrap gap-1.5 px-5 py-4">
                {event.symptoms.map((s, i) => (
                  <span key={i} className="rounded-md border border-line px-2 py-0.5 text-xs text-fg-muted">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}
