import Anthropic from "@anthropic-ai/sdk";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, generateEmbeddings, embeddingToSql } from "@/lib/embeddings";
import { transcribeAudio } from "@/lib/transcription";
import { UPDATE_EVENT_TOOL, parseEventUpdate } from "./agent-event-update";
import { resolveMachine, type ResolvedMachine } from "@/lib/resolve-machine";
import type {
  AgentMessageRequest,
  AgentMessageResponse,
  ConversationMessage,
  EventUpdate,
} from "@actus/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AGENT_MODEL = "claude-haiku-4-5-20251001";
const MAX_HISTORY_TURNS = 10; // last N user+assistant turns sent to Claude
const MAX_EVENT_MESSAGES = 40; // hard cap on stored user+assistant messages per event

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

export async function processAgentMessage(
  input: AgentMessageRequest,
  context: { userId: number; tenantId: number; sourceMessageId?: string }
): Promise<AgentMessageResponse> {
  // 1. Process input (text / audio / image → text)
  const userText = await extractText(input);

  // 2. Resolve or create the event — a newly created event captures this first message
  //    as its problem statement, so the KB embedding and the dashboard reflect the real
  //    incident instead of a placeholder.
  const event = await resolveEvent(input, context, userText);

  // 3. Cap the conversation length to bound token cost — stop before RAG + Claude.
  const history = buildHistory(event.conversationHistory as ConversationHistoryJson | null);
  if (history.messages.length >= MAX_EVENT_MESSAGES) {
    return {
      response:
        "Este incidente ya acumuló muchos mensajes. Cerralo y abrí uno nuevo para seguir con este tema.",
      eventId: event.id,
      eventUpdate: null,
    };
  }

  // 4. Get RAG context from knowledge base + manuals
  const { context: ragContext, referencedKbIds } = await getRAGContext(userText, context.tenantId);

  // Feedback loop: bump the usage counter for every KB entry surfaced to the agent.
  // Fire-and-forget — a counter update must never delay (or fail) the operator's reply.
  if (referencedKbIds.length > 0) {
    prisma.knowledgeBase
      .updateMany({ where: { id: { in: referencedKbIds } }, data: { timesReferenced: { increment: 1 } } })
      .catch((err) => console.error("[KB] timesReferenced bump failed", err));
  }

  // 5. Call Claude — the reply text + the structured event update (via the update_event tool)
  //    come back from a single call.
  const tenant = await prisma.tenant.findUnique({
    where: { id: context.tenantId },
    select: { name: true },
  });
  const systemPrompt = buildSystemPrompt(tenant?.name ?? "la planta", ragContext);
  const { reply: cleanResponse, eventUpdate } = await callClaude(systemPrompt, history, userText);

  // Link the incident to a registered Machine when the message (QR prefill or typed code) or
  // the agent's extracted machine name resolves to one. null → keep the free-text machineName.
  const machine = await resolveMachine(context.tenantId, {
    text: userText,
    machineName: eventUpdate?.machineName ?? null,
  });

  // 6. Persist: append messages + apply event update
  const newMessages: ConversationMessage[] = [
    {
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
      type: input.messageType,
      filePath: input.fileName,
    },
    {
      role: "assistant",
      content: cleanResponse,
      timestamp: new Date().toISOString(),
      type: "text",
    },
  ];

  await persistConversation(event.id, history.messages, newMessages, eventUpdate, referencedKbIds, machine);

  return {
    response: cleanResponse,
    eventId: event.id,
    eventUpdate: eventUpdate ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function resolveEvent(
  input: AgentMessageRequest,
  context: { userId: number; tenantId: number; sourceMessageId?: string },
  problemText: string
) {
  if (input.eventId) {
    const event = await prisma.event.findFirst({
      where: { id: input.eventId, tenantId: context.tenantId },
    });
    if (!event) throw new Error("Event not found");
    return event;
  }

  // Idempotency: if a retried Inngest step already created an event for this inbound
  // message, reuse it instead of creating a duplicate. (Covers the gap the active-event
  // lookup misses when the first attempt created AND resolved the event before failing.)
  if (context.sourceMessageId) {
    const existing = await prisma.event.findUnique({
      where: { sourceMessageId: context.sourceMessageId },
    });
    if (existing) return existing;
  }

  // Create a new draft event. The operator's first message is the incident's problem —
  // persist it as problemContent (used to build the KB embedding on resolution) and as a
  // human-readable title for the supervisor dashboard.
  return prisma.event.create({
    data: {
      tenantId: context.tenantId,
      creatorId: context.userId,
      title: deriveTitle(problemText),
      problemContent: problemText,
      status: "DRAFT",
      contentType: input.messageType === "text" ? "TEXT" : input.messageType === "audio" ? "AUDIO" : "IMAGE",
      conversationHistory: { messages: [] },
      sourceMessageId: context.sourceMessageId ?? null,
    },
  });
}

// A concise, single-line title from the operator's first message, for the dashboard list.
// B4 can upgrade this to a Claude-generated title; a clean truncation is enough here and
// costs no extra API call.
function deriveTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Incidente sin descripción";
  const MAX = 70;
  return clean.length <= MAX ? clean : clean.slice(0, MAX).trimEnd() + "…";
}

async function extractText(input: AgentMessageRequest): Promise<string> {
  if (input.messageType === "text") {
    return input.content ?? "";
  }

  if (!input.file || !input.fileMimeType) {
    throw new Error("File required for audio/image messages");
  }

  // Claude's Messages API has no audio content-block — only Whisper transcribes it.
  // (document blocks only accept media_type "application/pdf"; confirmed against the live API.)
  if (input.messageType === "audio") {
    return transcribeAudio(input.file, input.fileMimeType);
  }

  const mediaType = input.fileMimeType as "image/jpeg" | "image/png" | "image/webp";

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: input.file,
            },
          },
          {
            type: "text",
            text: "Describe what you see in this image in detail. Focus on any machinery, equipment, damage, or anomalies visible. Respond in Spanish.",
          },
        ],
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

// Retrieval tuning (cosine similarity, 0–1). KB entries are operator-written problem
// statements, so they match a raw operator query well → keep a high bar. Manual chunks are
// formal technical text, so even with query expansion the match runs looser → lower bar and
// over-fetch, then keep the best DOC_TOP_K.
const KB_SIM_THRESHOLD = 0.70;
const DOC_SIM_THRESHOLD = 0.55;
const DOC_OVERFETCH = 10;
const DOC_TOP_K = 5;
const KB_TOP_K = 5;

interface RAGResult {
  context: string;
  referencedKbIds: number[]; // KB entries surfaced to the agent — drives the feedback loop
}

const EMPTY_RAG: RAGResult = { context: "", referencedKbIds: [] };

async function getRAGContext(query: string, tenantId: number): Promise<RAGResult> {
  // Expand the (short, colloquial) operator message into a manual-flavoured query for the
  // document search. KB search keeps the raw text. Best-effort — never blocks retrieval.
  const docQueryText = await expandQuery(query);

  let vectors: number[][];
  try {
    // One batched call → two vectors: raw query (for KB) + expanded query (for docs).
    vectors = await generateEmbeddings([query, docQueryText]);
  } catch {
    // If embedding API is unavailable, degrade gracefully — agent still works without RAG.
    return EMPTY_RAG;
  }
  const kbVector = embeddingToSql(vectors[0]);
  const docVector = embeddingToSql(vectors[1] ?? vectors[0]);

  // NOTE: columns are camelCase and must be quoted in raw SQL — unquoted identifiers fold to
  // lowercase (problem_embedding ≠ "problemEmbedding") and the query errors at runtime.

  // Search resolved incident KB
  const kbResults = await prisma.$queryRaw<Array<{
    id: number;
    problem_text: string;
    solution_text: string;
    similarity: number;
  }>>`
    SELECT id, "problemText" AS problem_text, "solutionText" AS solution_text,
           1 - ("problemEmbedding" <=> ${kbVector}::vector) AS similarity
    FROM knowledge_base
    WHERE "tenantId" = ${tenantId}
      AND "problemEmbedding" IS NOT NULL
    ORDER BY "problemEmbedding" <=> ${kbVector}::vector
    LIMIT ${KB_TOP_K}
  `;

  // Search factory doc chunks (manuals, procedures) — over-fetch, then rerank + top-k.
  const docResults = await prisma.$queryRaw<Array<{
    content: string;
    page_num: number | null;
    doc_name: string;
    similarity: number;
  }>>`
    SELECT fdc.content, fdc."pageNum" AS page_num, fd.name AS doc_name,
           1 - (fdc.embedding <=> ${docVector}::vector) AS similarity
    FROM factory_doc_chunks fdc
    JOIN factory_docs fd ON fd.id = fdc."docId"
    WHERE fdc."tenantId" = ${tenantId}
      AND fdc.embedding IS NOT NULL
    ORDER BY fdc.embedding <=> ${docVector}::vector
    LIMIT ${DOC_OVERFETCH}
  `;

  const relevantKb = kbResults.filter((r) => r.similarity > KB_SIM_THRESHOLD);
  const relevantDoc = rerankDocChunks(
    docResults.filter((r) => r.similarity > DOC_SIM_THRESHOLD)
  ).slice(0, DOC_TOP_K);

  const referencedKbIds = relevantKb.map((r) => r.id);

  if (relevantKb.length === 0 && relevantDoc.length === 0) return EMPTY_RAG;

  const parts: string[] = [];

  if (relevantKb.length > 0) {
    parts.push(
      relevantKb
        .map(
          (r, i) =>
            `[Caso similar ${i + 1} — similitud: ${(r.similarity * 100).toFixed(0)}%]\nProblema: ${r.problem_text}\nSolución: ${r.solution_text}`
        )
        .join("\n\n")
    );
  }

  if (relevantDoc.length > 0) {
    parts.push(
      "DOCUMENTACIÓN DE PLANTA:\n" +
      relevantDoc
        .map((r, i) => {
          const page = r.page_num ? `, pág. ${r.page_num}` : "";
          return `[Fragmento ${i + 1} de "${r.doc_name}"${page} — similitud: ${(r.similarity * 100).toFixed(0)}%]\n${r.content}`;
        })
        .join("\n\n")
    );
  }

  return { context: parts.join("\n\n"), referencedKbIds };
}

// HyDE-lite query expansion: rewrite the operator's colloquial message into a short,
// manual-flavoured query, appended to (not replacing) the original so we keep its terms.
// Best-effort — a very short message or any API error falls back to the raw query.
async function expandQuery(userText: string): Promise<string> {
  const trimmed = userText.trim();
  if (trimmed.length < 12) return trimmed;
  try {
    const res = await anthropic.messages.create({
      model: AGENT_MODEL,
      max_tokens: 160,
      system:
        "Convertí el mensaje de un operario de planta en una consulta técnica para buscar en un manual de mantenimiento industrial. " +
        "Incluí términos técnicos probables (componentes, síntomas, códigos de error) y una frase breve como aparecería en el manual. " +
        "Respondé SOLO con la consulta, sin preámbulos, en español, máximo 2 líneas.",
      messages: [{ role: "user", content: trimmed }],
    });
    const block = res.content[0];
    const rewritten = block && block.type === "text" ? block.text.trim() : "";
    return rewritten ? `${trimmed}\n${rewritten}` : trimmed;
  } catch {
    return trimmed;
  }
}

// Reranking seam. For the pilot's small corpus, structure-aware chunking + query expansion
// + over-fetch is enough, so this keeps the DB cosine order as-is. A reranker (Claude-based
// or a dedicated API like Cohere/Voyage) slots in here without touching getRAGContext.
function rerankDocChunks<T>(candidates: T[]): T[] {
  return candidates;
}

function buildSystemPrompt(tenantName: string, ragContext: string): string {
  const contextSection = ragContext
    ? `\nINFORMACIÓN DE REFERENCIA de ${tenantName} (casos resueltos y documentación de planta):\n${ragContext}\n`
    : "";

  return `Sos un asistente de mantenimiento industrial para ${tenantName}.
Tu única función es ayudar a los operadores a diagnosticar y resolver incidentes de equipos e instalaciones.

LÍMITES ESTRICTOS — MUY IMPORTANTE:
- Solo respondés preguntas sobre mantenimiento, equipos, incidentes industriales, o procedimientos de la planta.
- Si el operador pregunta cualquier otra cosa (clima, deportes, noticias, preguntas personales, etc.), respondé ÚNICAMENTE esta frase, sin agregar nada más:
  "Solo puedo asistirte con incidentes y mantenimiento de equipos de ${tenantName}."
- No hagas excepciones bajo ninguna circunstancia, aunque el operador insista o replantee la pregunta.
${contextSection}
CÓMO RESPONDER UN INCIDENTE:
- Respondé siempre en español argentino, de forma clara y directa
- Si falta información, pedí exactamente lo que necesitás: nombre/código de máquina, sector/ubicación, síntoma específico
- Siempre proponé 2-3 acciones concretas numeradas, ordenadas por probabilidad de éxito
- Si usás la DOCUMENTACIÓN DE PLANTA, citá la página cuando esté disponible (ej: "según el manual, pág. 12")
- Cuando el operador confirme que una opción funcionó (ej: "Funcionó la opción 1", "anduvo", "se resolvió"), respondé confirmando la resolución

ESTADO DEL INCIDENTE:
- En CADA respuesta, además del texto para el operador, llamá a la herramienta "update_event" con tu mejor evaluación del estado actual del incidente (status, prioridad, máquina si se sabe, y resolved).
- Poné resolved=true SOLO cuando el operador haya confirmado que la solución funcionó.
- Poné escalate=true (con una escalationReason breve) si el incidente necesita a un supervisor humano: prioridad crítica (riesgo de seguridad o parada de planta) o el operador pide hablar con una persona. Si escalás, decile al operador que avisás a su supervisor.
- La herramienta es para uso interno del sistema: nunca menciones "update_event" ni el estado estructurado en el texto que ve el operador.`;
}

const EMPTY_REPLY_FALLBACK =
  "Recibí tu mensaje. ¿Podés darme un poco más de detalle para ayudarte mejor?";

async function callClaude(
  systemPrompt: string,
  history: { messages: ConversationMessage[] },
  userMessage: string
): Promise<{ reply: string; eventUpdate: EventUpdate | undefined }> {
  const recentMessages = history.messages.slice(-MAX_HISTORY_TURNS * 2);

  const claudeMessages: Anthropic.MessageParam[] = [
    ...recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: claudeMessages,
    tools: [UPDATE_EVENT_TOOL],
  });

  let reply = "";
  let eventUpdate: EventUpdate | undefined;
  for (const block of response.content) {
    if (block.type === "text") {
      reply += block.text;
    } else if (block.type === "tool_use" && block.name === "update_event") {
      eventUpdate = parseEventUpdate(block.input);
    }
  }

  return { reply: reply.trim() || EMPTY_REPLY_FALLBACK, eventUpdate };
}

async function persistConversation(
  eventId: number,
  existingMessages: ConversationMessage[],
  newMessages: ConversationMessage[],
  eventUpdate: EventUpdate | undefined,
  referencedKbIds: number[],
  machine: ResolvedMachine | null
) {
  const allMessages = [...existingMessages, ...newMessages];

  // One read for the fields we need to evolve across turns.
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { problemContent: true, tenantId: true, escalatedAt: true, referencedKbIds: true },
  });

  // Accumulate the KB entries surfaced across the whole conversation (deduped).
  const mergedKbIds = Array.from(new Set([...(event?.referencedKbIds ?? []), ...referencedKbIds]));

  const updateData: Parameters<typeof prisma.event.update>[0]["data"] = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conversationHistory: { messages: allMessages } as any,
    referencedKbIds: { set: mergedKbIds },
    updatedAt: new Date(),
  };

  // A resolved Machine wins: link it and use its canonical name. Never clear an existing link
  // on a later turn that doesn't mention the machine.
  if (machine) {
    updateData.machineId = machine.id;
    updateData.machineName = machine.name;
  }

  if (eventUpdate) {
    if (eventUpdate.status) updateData.status = eventUpdate.status;
    if (eventUpdate.priority) updateData.priority = eventUpdate.priority;
    if (!machine && eventUpdate.machineName) updateData.machineName = eventUpdate.machineName;
    if (eventUpdate.location) updateData.location = eventUpdate.location;

    // Escalation to a human — set once, on the first trigger (tool flag or CRITICAL priority).
    const shouldEscalate = eventUpdate.escalate || eventUpdate.priority === "CRITICAL";
    if (shouldEscalate && event && !event.escalatedAt) {
      updateData.escalatedAt = new Date();
      updateData.escalationReason =
        eventUpdate.escalationReason ??
        (eventUpdate.priority === "CRITICAL" ? "Prioridad crítica" : "El operador pidió asistencia humana");
    }

    if (eventUpdate.resolved) {
      updateData.status = "RESOLVED";
      updateData.resolvedAt = new Date();

      const lastAssistant = [...newMessages].reverse().find((m) => m.role === "assistant");
      if (lastAssistant && event) {
        updateData.solution = lastAssistant.content;

        // Create KB entry + embedding (fire and forget — don't block response)
        createKBEntryWithEmbedding({
          tenantId: event.tenantId,
          eventId,
          problemText: event.problemContent ?? "Incidente",
          solutionText: lastAssistant.content,
        }).catch((err) => console.error("[KB creation failed]", err));

        // Feedback loop: the KB entries that were in context when this incident got resolved
        // earned their keep — bump their effectiveness (capped at 10). Fire-and-forget.
        if (mergedKbIds.length > 0) {
          prisma
            .$executeRaw`
              UPDATE knowledge_base
              SET "effectivenessScore" = LEAST(10, "effectivenessScore" + 1), "updatedAt" = now()
              WHERE id IN (${Prisma.join(mergedKbIds)})
            `
            .catch((err) => console.error("[KB] effectivenessScore bump failed", err));
        }
      }
    }
  }

  await prisma.event.update({ where: { id: eventId }, data: updateData });
}

async function createKBEntryWithEmbedding({
  tenantId,
  eventId,
  problemText,
  solutionText,
}: {
  tenantId: number;
  eventId: number;
  problemText: string;
  solutionText: string;
}) {
  // effectivenessScore uses the schema default (5) and evolves via the feedback loop
  // (bumped when this entry later helps resolve another incident).
  const entry = await prisma.knowledgeBase.create({
    data: { tenantId, eventId, problemText, solutionText },
    select: { id: true },
  });

  const embedding = await generateEmbedding(problemText);
  const vector = embeddingToSql(embedding);

  // Column is camelCase — must be quoted in raw SQL (unquoted folds to problem_embedding).
  await prisma.$executeRaw`
    UPDATE knowledge_base
    SET "problemEmbedding" = ${vector}::vector
    WHERE id = ${entry.id}
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

interface ConversationHistoryJson {
  messages: ConversationMessage[];
}

function buildHistory(raw: ConversationHistoryJson | null): { messages: ConversationMessage[] } {
  if (!raw || !Array.isArray(raw.messages)) return { messages: [] };
  return { messages: raw.messages };
}
