import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Settings,
  MapPin,
  Calendar,
} from "lucide-react";
import type { EventSummary } from "@actus/types";

const STATUS_CONFIG = {
  DRAFT:       { label: "Borrador",    color: "#9e9e9e", Icon: AlertCircle },
  OPEN:        { label: "Abierto",     color: "#ff9800", Icon: AlertCircle },
  IN_PROGRESS: { label: "En Progreso", color: "#2196f3", Icon: Clock },
  RESOLVED:    { label: "Resuelto",    color: "#4caf50", Icon: CheckCircle },
  CLOSED:      { label: "Cerrado",     color: "#757575", Icon: XCircle },
} as const;

const PRIORITY_CONFIG = {
  LOW:      { label: "Baja",     color: "#4caf50" },
  MEDIUM:   { label: "Media",    color: "#ff9800" },
  HIGH:     { label: "Alta",     color: "#f44336" },
  CRITICAL: { label: "Crítica",  color: "#b71c1c" },
} as const;

const EVENT_TYPE_LABEL = {
  INCIDENT:    "Incidente",
  MAINTENANCE: "Mantenimiento",
  CONTROL:     "Control",
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface EventCardProps {
  event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
  const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.OPEN;
  const priority = PRIORITY_CONFIG[event.priority] ?? PRIORITY_CONFIG.MEDIUM;
  const StatusIcon = status.Icon;

  return (
    <Link href={`/dashboard/events/${event.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group-hover:-translate-y-0.5 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1">
              {event.title}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {/* Status badge */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                color: status.color,
                backgroundColor: `${status.color}15`,
                borderColor: `${status.color}30`,
              }}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
            {/* Priority badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ color: priority.color, backgroundColor: `${priority.color}15` }}
            >
              {priority.label}
            </span>
          </div>
        </div>

        <hr className="border-gray-100 mb-3" />

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <AlertTriangle size={14} className="text-gray-400" />
            <span>{EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}</span>
          </div>

          {event.creator && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <User size={14} className="text-gray-400" />
              <span>{event.creator.name} {event.creator.lastname}</span>
            </div>
          )}

          {event.machineName && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Settings size={14} className="text-gray-400" />
              <span>{event.machineName}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin size={14} className="text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <hr className="border-gray-100 mt-3 mb-2.5" />

        {/* Dates */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Creado: {formatDate(event.createdAt)}
          </span>
          {event.resolvedAt && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle size={12} />
              Resuelto: {formatDate(event.resolvedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
