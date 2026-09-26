import { inngest } from "../client";
import { whatsappMessageReceived } from "../events";
import { prisma } from "@/lib/prisma";
import { processAgentMessage } from "@/services/agent.service";
import { sendWhatsAppMessage, downloadWhatsAppMedia } from "@/services/whatsapp.service";
import type { AgentMessageRequest, MessageType } from "@actus/types";

const ACTIVE_STATUSES = ["DRAFT", "OPEN", "IN_PROGRESS"] as const;

const UNREGISTERED =
  "Tu número no está registrado en Actus. Pedile a tu supervisor que te agregue como operador.";
const UNSUPPORTED =
  "No pude procesar ese tipo de mensaje. Probá con texto, audio o una foto.";
const PROCESSING_FAILED =
  "No pude procesar tu mensaje por un error de nuestro lado. No se guardó nada: probá de nuevo en unos minutos.";

/**
 * Durable processing of an inbound WhatsApp message. Replaces the fire-and-forget
 * `after()` in the webhook: each step is an independent retry point, so a transient
 * failure (Claude overloaded, Whisper timeout) is retried instead of silently dropping
 * the operator's message. `onFailure` notifies the operator once retries are exhausted.
 *
 * Known limitation: `process-agent-message` creates the Event internally, so a retry of
 * that step after a mid-way failure can create a duplicate Event. Acceptable trade-off
 * vs. losing the message; fine-grained idempotency is future work.
 */
export const processWhatsAppMessage = inngest.createFunction(
  {
    id: "process-whatsapp-message",
    retries: 3,
    triggers: [{ event: whatsappMessageReceived }],
    onFailure: async ({ event }) => {
      const { waId } = event.data.event.data;
      try {
        await sendWhatsAppMessage(waId, PROCESSING_FAILED);
      } catch (err) {
        console.error("[whatsapp] could not notify operator of failure", err);
      }
    },
  },
  async ({ event, step }) => {
    const { waId, messageType, textBody, mediaId, mediaMimeType } = event.data;

    const user = await step.run("resolve-user", async () => {
      const u = await prisma.user.findUnique({ where: { phoneNumber: waId } });
      return u && u.tenantId ? { id: u.id, tenantId: u.tenantId } : null;
    });

    if (!user) {
      await step.run("reply-unregistered", () => sendWhatsAppMessage(waId, UNREGISTERED));
      return { status: "unregistered" as const };
    }

    // Media download + agent run happen in one step so the base64 payload never crosses
    // Inngest's serialized step state, and a resend retry below won't re-run this.
    const reply = await step.run("process-agent-message", async () => {
      const input = await buildAgentInput({ messageType, textBody, mediaId, mediaMimeType });
      if (!input) return UNSUPPORTED;

      const activeEvent = await prisma.event.findFirst({
        where: {
          tenantId: user.tenantId,
          creatorId: user.id,
          status: { in: [...ACTIVE_STATUSES] },
        },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });

      const result = await processAgentMessage(
        { ...input, eventId: activeEvent?.id },
        { userId: user.id, tenantId: user.tenantId }
      );
      return result.response;
    });

    // Separate step: a failed send is retried without re-running the agent.
    await step.run("reply", () => sendWhatsAppMessage(waId, reply));

    return { status: "processed" as const };
  }
);

async function buildAgentInput(msg: {
  messageType: string;
  textBody?: string;
  mediaId?: string;
  mediaMimeType?: string;
}): Promise<AgentMessageRequest | null> {
  if (msg.messageType === "text") {
    return msg.textBody ? { messageType: "text", content: msg.textBody } : null;
  }

  if ((msg.messageType === "audio" || msg.messageType === "image") && msg.mediaId) {
    const base64 = await downloadWhatsAppMedia(msg.mediaId);
    return {
      messageType: msg.messageType as MessageType,
      file: base64,
      fileMimeType: (msg.mediaMimeType ?? "").split(";")[0].trim(),
    };
  }

  return null;
}
