import { eventType } from "inngest";
import { z } from "zod";

// Internal event that triggers async processing of an inbound WhatsApp message.
// messageType is kept as a plain string (not an enum): unknown/unsupported WhatsApp
// message types still get enqueued and are answered with an "unsupported" reply by the
// function, instead of being dropped at the webhook.
export const whatsappMessageReceivedSchema = z.object({
  webhookEventId: z.string(),
  waId: z.string(),
  messageType: z.string(),
  textBody: z.string().optional(),
  mediaId: z.string().optional(),
  mediaMimeType: z.string().optional(),
});

// Inngest v4 `eventType`: used both as the typed trigger in createFunction and to build
// the validated payload sent with inngest.send() — a single source of truth for both sides.
// Namespaced under "actus/" on purpose: agrodata (same Inngest account) uses
// "whatsapp/message.received" too, and within one environment Inngest routes an event to
// every matching function across apps. A unique name keeps the two bots from cross-firing.
export const whatsappMessageReceived = eventType("actus/whatsapp.message.received", {
  schema: whatsappMessageReceivedSchema,
});
