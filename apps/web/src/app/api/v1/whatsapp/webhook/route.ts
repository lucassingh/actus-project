import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { whatsappMessageReceived } from "@/inngest/events";

interface WhatsAppMessage {
  id: string;
  from: string;
  type: "text" | "audio" | "image" | string;
  text?: { body: string };
  audio?: { id: string; mime_type: string };
  image?: { id: string; mime_type: string };
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string };
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
}

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
    const value = payload.entry?.[0]?.changes?.[0]?.value;
    // Every app subscribed to the WhatsApp Business Account gets every number's events —
    // only handle messages sent to Actus's own number.
    if (value?.metadata?.phone_number_id !== process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json({ received: true });
    }

    for (const message of value?.messages ?? []) {
      // Dedupe Meta's at-least-once redeliveries: a re-seen wamid is a no-op and skipped.
      if (!(await claimMessage(message.id))) continue;

      // Hand off to Inngest for durable, retryable processing — the reply is sent from
      // there, not here. Answering Meta fast (below) avoids retries/duplicate replies.
      const inngestEvent = whatsappMessageReceived.create({
        webhookEventId: message.id,
        waId: message.from,
        messageType: message.type,
        textBody: message.text?.body,
        mediaId: message.audio?.id ?? message.image?.id,
        mediaMimeType: message.audio?.mime_type ?? message.image?.mime_type,
      });

      try {
        await inngestEvent.validate();
        await inngest.send(inngestEvent);
      } catch (err) {
        // A malformed single message must not abort the batch nor make Meta retry the
        // whole payload forever.
        console.error("[whatsapp webhook] failed to enqueue message", message.id, err);
      }
    }
  } catch (err) {
    // Never fail this request for Meta — log and ack anyway, or Meta will retry/flag it.
    console.error("[POST /api/v1/whatsapp/webhook]", err);
  }

  return NextResponse.json({ received: true });
}

// Records the message id; returns false if it was already seen (a Meta redelivery).
async function claimMessage(messageId: string): Promise<boolean> {
  const { count } = await prisma.whatsAppInboundMessage.createMany({
    data: [{ id: messageId }],
    skipDuplicates: true,
  });
  return count === 1;
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
