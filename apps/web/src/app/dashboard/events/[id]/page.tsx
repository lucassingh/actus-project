import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Clock, AlertCircle, User, Settings, MapPin, MessageSquare, Bot } from "lucide-react";
import type { ConversationHistory } from "@actus/types";

const STATUS_CONFIG = {
  DRAFT:       { label: "Borrador",    color: "#9e9e9e" },
  OPEN:        { label: "Abierto",     color: "#ff9800" },
  IN_PROGRESS: { label: "En Progreso", color: "#2196f3" },
  RESOLVED:    { label: "Resuelto",    color: "#4caf50" },
  CLOSED:      { label: "Cerrado",     color: "#757575" },
} as const;

const PRIORITY_CONFIG = {
  LOW:      { label: "Baja",    color: "#4caf50" },
  MEDIUM:   { label: "Media",   color: "#ff9800" },
  HIGH:     { label: "Alta",    color: "#f44336" },
  CRITICAL: { label: "Crítica", color: "#b71c1c" },
} as const;

function formatDate(iso: Date | null | string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

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

  const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.OPEN;
  const priority = PRIORITY_CONFIG[event.priority] ?? PRIORITY_CONFIG.MEDIUM;
  const history = (event.conversationHistory as ConversationHistory | null)?.messages ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <a href="/dashboard/events" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Volver a eventos
      </a>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{event.title}</h1>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ color: status.color, backgroundColor: `${status.color}15`, borderColor: `${status.color}30` }}
            >
              {status.label}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ color: priority.color, backgroundColor: `${priority.color}15` }}
            >
              {priority.label}
            </span>
          </div>
        </div>

        {event.description && (
          <p className="text-gray-600 text-sm mb-4">{event.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <User size={14} className="text-gray-400" />
            <span>{event.creator.name} {event.creator.lastname}</span>
          </div>
          {event.machineName && (
            <div className="flex items-center gap-2 text-gray-500">
              <Settings size={14} className="text-gray-400" />
              <span>{event.machineName}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={14} className="text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={14} className="text-gray-400" />
            <span>{formatDate(event.createdAt)}</span>
          </div>
          {event.resolvedAt && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={14} />
              <span>Resuelto: {formatDate(event.resolvedAt)}</span>
            </div>
          )}
        </div>

        {event.symptoms.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 font-medium mb-1.5">Síntomas</p>
            <div className="flex flex-wrap gap-1.5">
              {event.symptoms.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.solution && (
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle size={12} />
              Solución aplicada
            </p>
            <p className="text-sm text-green-800">{event.solution}</p>
          </div>
        )}
      </div>

      {/* Conversation history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={18} style={{ color: "var(--primary)" }} />
          Conversación con el agente
          <span className="text-xs text-gray-400 font-normal ml-1">({history.length} mensajes)</span>
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">Sin historial de conversación</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {history.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={i} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                    >
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      isUser
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-gray-50 text-gray-800 border border-gray-100"
                    }`}
                    style={isUser ? { backgroundColor: "var(--primary)" } : {}}
                  >
                    {msg.type !== "text" && (
                      <span className="text-xs opacity-60 block mb-1 uppercase font-medium">
                        [{msg.type}]
                      </span>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1.5 ${isUser ? "text-white/60" : "text-gray-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
