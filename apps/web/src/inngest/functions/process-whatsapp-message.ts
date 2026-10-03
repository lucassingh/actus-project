import * as Sentry from "@sentry/nextjs";
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
 * Event creation is idempotent across retries: the inbound wamid is passed as
 * `sourceMessageId`, and resolveEvent reuses the event with that id instead of creating a
 * duplicate (see agent.service.ts).
 */
export const processWhatsAppMessage = inngest.createFunction(
  {
    id: "process-whatsapp-message",
    retries: 3,
    // One message at a time per operator: keeps the conversation-history read/modify/write
    // from racing when someone fires several messages at once.
    concurrency: { limit: 1, key: "event.data.waId" },
    // Cost/abuse guard: cap how many messages one operator can drive per minute. Excess is
    // queued (not dropped), so a legit burst just slows down.
    throttle: { limit: 15, period: "60s", key: "event.data.waId" },
    triggers: [{ event: whatsappMessageReceived }],
    onFailure: async ({ event, error }) => {
      const { waId, webhookEventId } = event.data.event.data;
      Sentry.captureException(error, {
        tags: { flow: "whatsapp" },
        extra: { waId, webhookEventId },
      });
      console.error("[whatsapp] message failed after retries", {
        waId,
        webhookEventId,
        error: error?.message,
      });
      try {
        await sendWhatsAppMessage(waId, PROCESSING_FAILED);
      } catch (err) {
        console.error("[whatsapp] could not notify operator of failure", err);
      }
    },
  },
  async ({ event, step }) => {
    const { waId, webhookEventId, messageType, textBody, mediaId, mediaMimeType } = event.data;

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
      const built = await buildAgentInput({ messageType, textBody, mediaId, mediaMimeType });
      if ("reject" in built) return built.reject;

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
        { ...built.input, eventId: activeEvent?.id },
        // sourceMessageId (the wamid) makes event creation idempotent across step retries.
        { userId: user.id, tenantId: user.tenantId, sourceMessageId: webhookEventId }
      );
      return result.response;
    });

    // Separate step: a failed send is retried without re-running the agent.
    await step.run("reply", () => sendWhatsAppMessage(waId, reply));

    return { status: "processed" as const };
  }
);

const SUPPORTED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // Claude vision is happiest under ~5 MB per image
const AUDIO_MAX_BYTES = 16 * 1024 * 1024; // WhatsApp caps voice notes; Whisper accepts up to 25 MB

type BuiltInput = { input: AgentMessageRequest } | { reject: string };

async function buildAgentInput(msg: {
  messageType: string;
  textBody?: string;
  mediaId?: string;
  mediaMimeType?: string;
}): Promise<BuiltInput> {
  if (msg.messageType === "text") {
    return msg.textBody ? { input: { messageType: "text", content: msg.textBody } } : { reject: UNSUPPORTED };
  }

  if ((msg.messageType === "audio" || msg.messageType === "image") && msg.mediaId) {
    const base64 = await downloadWhatsAppMedia(msg.mediaId);
    const bytes = Math.floor((base64.length * 3) / 4); // approx decoded size from base64 length
    const mime = (msg.mediaMimeType ?? "").split(";")[0].trim();

    if (msg.messageType === "image") {
      if (!SUPPORTED_IMAGE_MIME.has(mime)) {
        return { reject: "Formato de imagen no soportado. Mandá una foto JPG, PNG o WEBP." };
      }
      if (bytes > IMAGE_MAX_BYTES) {
        return { reject: "La imagen es muy grande (máx 5 MB). Mandá una más liviana." };
      }
    } else if (bytes > AUDIO_MAX_BYTES) {
      return { reject: "El audio es muy largo (máx 16 MB). Mandá uno más corto." };
    }

    return { input: { messageType: msg.messageType as MessageType, file: base64, fileMimeType: mime } };
  }

  return { reject: UNSUPPORTED };
}
