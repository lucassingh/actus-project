// Machine identity & QR helpers — pure, side-effect-free (no DB), so they're unit-testable.
// The DB-backed resolver lives in ./resolve-machine (it imports Prisma).
//
// The QR on each machine opens WhatsApp to the bot with "Máquina <code>: " pre-filled, so the
// operator's first message carries the code. But linking does NOT depend on the QR: the bot
// matches whatever code/name the operator wrote — scanned, typed, or extracted by the agent —
// against the tenant's machines, after normalizing away case, spaces and separators. So
// "COMP-005", "comp 005" and "comp005" all resolve to the same machine, and a plant without
// stickers works by typing the code.

export interface ResolvedMachine {
  id: number;
  name: string;
}

/** Fold a code/name to a comparison key: lowercase, strip accents and everything but a–z/0–9. */
export function normalizeMachineKey(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Pre-filled WhatsApp text for a machine's QR / manual entry. */
export function machinePrefill(code: string): string {
  return `Máquina ${code}: `;
}

/** wa.me deep link that opens the bot with the machine pre-identified, or null if the bot
 *  number isn't configured (WHATSAPP_BOT_NUMBER — the visible E.164 number, not the Graph id). */
export function machineWaLink(code: string): string | null {
  const num = process.env.WHATSAPP_BOT_NUMBER?.replace(/\D/g, "");
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(machinePrefill(code))}`;
}
