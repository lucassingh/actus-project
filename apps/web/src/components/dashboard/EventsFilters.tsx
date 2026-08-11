"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "DRAFT", label: "Borrador" },
  { value: "OPEN", label: "Abierto" },
  { value: "IN_PROGRESS", label: "En Progreso" },
  { value: "RESOLVED", label: "Resuelto" },
  { value: "CLOSED", label: "Cerrado" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "Todas las prioridades" },
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "INCIDENT", label: "Incidente" },
  { value: "MAINTENANCE", label: "Mantenimiento" },
  { value: "CONTROL", label: "Control" },
];

export function EventsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [priority, setPriority] = useState(searchParams.get("priority") ?? "");
  const [eventType, setEventType] = useState(searchParams.get("eventType") ?? "");

  const apply = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (eventType) params.set("eventType", eventType);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clear = () => {
    setStatus("");
    setPriority("");
    setEventType("");
    startTransition(() => router.push(pathname));
  };

  const hasActiveFilters = !!(status || priority || eventType);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-32">
          <label className="text-xs text-gray-500 font-medium">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-32">
          <label className="text-xs text-gray-500 font-medium">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-32">
          <label className="text-xs text-gray-500 font-medium">Tipo</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={apply}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Search size={14} />
            Filtrar
          </button>

          {hasActiveFilters && (
            <button
              onClick={clear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
