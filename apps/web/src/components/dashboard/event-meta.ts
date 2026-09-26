import type { Tone } from "./ui";

export const EVENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Borrador", tone: "neutral" },
  OPEN: { label: "Abierto", tone: "accent" },
  IN_PROGRESS: { label: "En progreso", tone: "info" },
  RESOLVED: { label: "Resuelto", tone: "success" },
  CLOSED: { label: "Cerrado", tone: "neutral" },
};

export const EVENT_PRIORITY: Record<string, { label: string; tone: Tone }> = {
  LOW: { label: "Baja", tone: "neutral" },
  MEDIUM: { label: "Media", tone: "warning" },
  HIGH: { label: "Alta", tone: "danger" },
  CRITICAL: { label: "Crítica", tone: "danger" },
};

export const EVENT_TYPE: Record<string, string> = {
  INCIDENT: "Incidente",
  MAINTENANCE: "Mantenimiento",
  CONTROL: "Control",
};
