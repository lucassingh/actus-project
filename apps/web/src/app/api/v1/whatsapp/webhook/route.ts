import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { processAgentMessage } from "@/services/agent.service";
import { sendWhatsAppMessage, downloadWhatsAppMedia } from "@/services/whatsapp.service";
import type { AgentMessageRequest, MessageType } from "@actus/types";

interface WhatsAppMessage {
  from: string;
  type: "text" | "audio" | "image" | string;
  text?: { body: string };
  audio?: { id: string; mime_type: string };
  image?: { id: string; mime_type: string };
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: WhatsAppMessage[] };
    }>;
  }>;
}

const ACTIVE_STATUSES = ["DRAFT", "OPEN", "IN_PROGRESS"] as const;

// Meta's handshake when the webhook URL is registered — must echo back hub.challenge.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!hasValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;

  try {
    const messages = payload.entry?.[0]?.changes?.[0]?.value?.messages ?? [];
    for (const message of messages) {
      await handleIncomingMessage(message);
    }
  } catch (err) {
    // Never fail this request for Meta — log and ack anyway, or Meta will retry/flag the webhook.
    console.error("[POST /api/v1/whatsapp/webhook]", err);
  }

  return NextResponse.json({ received: true });
}

function hasValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET!).update(rawBody).digest("hex");

  const received = Buffer.from(signatureHeader);
  const expectedBuf = Buffer.from(expected);
  return received.length === expectedBuf.length && crypto.timingSafeEqual(received, expectedBuf);
}

async function handleIncomingMessage(message: WhatsAppMessage): Promise<void> {
  const from = message.from;

  const user = await prisma.user.findUnique({ where: { phoneNumber: from } });
  if (!user || !user.tenantId) {
    await sendWhatsAppMessage(
      from,
      "Tu número no está registrado en Actus. Pedile a tu supervisor que te agregue como operador."
    );
    return;
  }

  const input = await buildAgentInput(message);
  if (!input) {
    await sendWhatsAppMessage(from, "No pude procesar ese tipo de mensaje. Probá con texto, audio o una foto.");
    return;
  }

  input.eventId = await findActiveEventId(user.id, user.tenantId);

  const result = await processAgentMessage(input, { userId: user.id, tenantId: user.tenantId });

  await sendWhatsAppMessage(from, result.response);
}

async function buildAgentInput(message: WhatsAppMessage): Promise<AgentMessageRequest | null> {
  if (message.type === "text" && message.text) {
    return { messageType: "text", content: message.text.body };
  }

  if ((message.type === "audio" || message.type === "image") && message[message.type]) {
    const media = message[message.type]!;
    const base64 = await downloadWhatsAppMedia(media.id);
    return {
      messageType: message.type as MessageType,
      file: base64,
      fileMimeType: media.mime_type.split(";")[0].trim(), // strip "; codecs=opus" etc.
    };
  }

  return null;
}

// Keeps a WhatsApp conversation attached to the same incident until it's resolved/closed,
// mirroring how the mobile app holds eventId in the chat screen's client-side state.
async function findActiveEventId(userId: number, tenantId: number): Promise<number | undefined> {
  const event = await prisma.event.findFirst({
    where: { tenantId, creatorId: userId, status: { in: [...ACTIVE_STATUSES] } },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  return event?.id;
}
