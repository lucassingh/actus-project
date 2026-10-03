import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { EventUpdate } from "@actus/types";

// Structured event-state extraction via tool use. Claude replies to the operator in text AND
// calls `update_event` with the structured state in the same turn — this replaces the old
// `[[META|...]]` block parsed by regex. One Zod schema both documents the tool's input and
// validates whatever Claude returns, so a malformed call degrades to "no update" instead of
// writing garbage to the event.
//
// Kept in its own side-effect-free module (only `zod` + types) so it's unit-testable without
// pulling in the Prisma/Anthropic/OpenAI clients that agent.service.ts constructs on import.

export const EVENT_STATUSES = ["DRAFT", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const eventUpdateToolSchema = z.object({
  status: z.enum(EVENT_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  machineName: z.string().nullish(),
  location: z.string().nullish(),
  resolved: z.boolean().optional(),
});

export const UPDATE_EVENT_TOOL: Anthropic.Tool = {
  name: "update_event",
  description:
    "Registra el estado estructurado del incidente según la conversación. Llamala en cada respuesta con tu mejor evaluación actual. Es de uso interno — su contenido no se le muestra al operador.",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: [...EVENT_STATUSES],
        description: "Estado del incidente. DRAFT recién abierto, IN_PROGRESS diagnosticando, RESOLVED resuelto.",
      },
      priority: {
        type: "string",
        enum: [...PRIORITIES],
        description: "Prioridad según riesgo/impacto. CRITICAL si hay riesgo de seguridad o parada de planta.",
      },
      machineName: {
        type: "string",
        description: "Nombre o código de la máquina. Omitir si no se sabe.",
      },
      location: {
        type: "string",
        description: "Sector o ubicación. Omitir si no se sabe.",
      },
      resolved: {
        type: "boolean",
        description: "true SOLO cuando el operador confirmó que la solución funcionó.",
      },
    },
    required: ["status", "priority", "resolved"],
  },
};

// Validate the raw tool-call input and map it to an EventUpdate. Returns undefined when the
// input is malformed or carries no actionable field, so the caller writes nothing.
export function parseEventUpdate(input: unknown): EventUpdate | undefined {
  const parsed = eventUpdateToolSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[agent] update_event input failed validation", parsed.error.issues);
    return undefined;
  }

  const d = parsed.data;
  const update: EventUpdate = {};
  if (d.status) update.status = d.status;
  if (d.priority) update.priority = d.priority;
  if (d.machineName) update.machineName = d.machineName;
  if (d.location) update.location = d.location;
  if (d.resolved) update.resolved = true;

  return Object.keys(update).length > 0 ? update : undefined;
}
