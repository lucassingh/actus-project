const GRAPH_API_VERSION = "v26.0";

function graphUrl(path: string): string {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${path}`;
}

function authHeader(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` };
}

// Meta's sandbox recipient allow-list does an exact string match against the number
// used to verify the recipient, but Argentine mobile numbers arrive in `message.from`
// WITH the "9" (e.g. 5493462565888) while the allow-list check has been repeatedly
// reported (Meta Cloud API, dev/sandbox mode only) to expect it WITHOUT the "9"
// (5493462565888 -> 543462565888). This only affects outbound sends in sandbox mode —
// production numbers (post Business verification) have no allow-list at all. Keep the
// "9" version as the User.phoneNumber lookup key (that's what `from` always sends);
// only strip it here, on the way out.
function toSandboxSendFormat(phoneNumber: string): string {
  return phoneNumber.startsWith("549") ? "54" + phoneNumber.slice(3) : phoneNumber;
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const res = await fetch(graphUrl(`${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`), {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toSandboxSendFormat(to),
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) {
    console.error("[whatsapp.service] sendWhatsAppMessage failed", res.status, await res.text());
  }
}

// WhatsApp media isn't fetched by URL directly — first resolve a short-lived
// download URL from the media ID, then fetch the bytes from that URL.
export async function downloadWhatsAppMedia(mediaId: string): Promise<string> {
  const metaRes = await fetch(graphUrl(mediaId), { headers: authHeader() });
  if (!metaRes.ok) {
    throw new Error(`Failed to resolve WhatsApp media URL (${metaRes.status})`);
  }
  const { url } = (await metaRes.json()) as { url: string };

  const fileRes = await fetch(url, { headers: authHeader() });
  if (!fileRes.ok) {
    throw new Error(`Failed to download WhatsApp media (${fileRes.status})`);
  }

  const arrayBuffer = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
