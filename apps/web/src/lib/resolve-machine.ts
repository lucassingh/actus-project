import { prisma } from "@/lib/prisma";
import { normalizeMachineKey, type ResolvedMachine } from "./machines";

export type { ResolvedMachine } from "./machines";

// Short codes would cause false substring matches ("A1" inside "garantia1"), so the
// message-scan path only trusts codes of at least this many normalized chars.
const MIN_SCAN_KEY_LEN = 4;

/**
 * Resolve an operator message (and the agent's extracted machine name) to a registered
 * Machine for this tenant. Returns null when nothing matches — the caller then keeps the
 * free-text machineName, exactly as before. Two passes:
 *   1. Exact normalized match of the agent-extracted name to a machine code or name.
 *   2. Substring scan of the raw message for a machine code (length-guarded).
 */
export async function resolveMachine(
  tenantId: number,
  opts: { text?: string | null; machineName?: string | null }
): Promise<ResolvedMachine | null> {
  const machines = await prisma.machine.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, code: true, name: true },
  });
  if (machines.length === 0) return null;

  const indexed = machines.map((m) => ({
    id: m.id,
    name: m.name,
    codeKey: normalizeMachineKey(m.code),
    nameKey: normalizeMachineKey(m.name),
  }));

  // 1) The agent extracted a machine identifier → exact normalized match to code or name.
  if (opts.machineName) {
    const key = normalizeMachineKey(opts.machineName);
    if (key) {
      const hit = indexed.find((m) => m.codeKey === key || m.nameKey === key);
      if (hit) return { id: hit.id, name: hit.name };
    }
  }

  // 2) Scan the raw message for a machine code (handles QR prefill and free-typed codes).
  if (opts.text) {
    const textKey = normalizeMachineKey(opts.text);
    if (textKey) {
      const hit = indexed.find((m) => m.codeKey.length >= MIN_SCAN_KEY_LEN && textKey.includes(m.codeKey));
      if (hit) return { id: hit.id, name: hit.name };
    }
  }

  return null;
}
