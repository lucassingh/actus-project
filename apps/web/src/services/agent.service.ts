import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, embeddingToSql } from "@/lib/embeddings";
import { transcribeAudio } from "@/lib/transcription";
import type {
  AgentMessageRequest,
  AgentMessageResponse,
  ConversationMessage,
  EventUpdate,
} from "@actus/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AGENT_MODEL = "claude-haiku-4-5-20251001";
const MAX_HISTORY_TURNS = 10; // last N user+assistant turns sent to Claude

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

export async function processAgentMessage(
  input: AgentMessageRequest,
  context: { userId: number; tenantId: number }
): Promise<AgentMessageResponse> {
  // 1. Resolve or create the event
  const event = await resolveEvent(input, context);

  // 2. Process input (text / audio / image → text)
  const userText = await extractText(input);

  // 3. Get RAG context from knowledge base
  const ragContext = await getRAGContext(userText, context.tenantId);

  // 4. Build conversation history from the event
  const history = buildHistory(event.conversationHistory as ConversationHistoryJson | null);

  // 5. Call Claude
  const tenant = await prisma.tenant.findUnique({
    where: { id: context.tenantId },
    select: { name: true },
  });
  const systemPrompt = buildSystemPrompt(tenant?.name ?? "la planta", ragContext);
  const claudeResponse = await callClaude(systemPrompt, history, userText);

  // 6. Extract structured event update from Claude response
  const { cleanResponse, eventUpdate } = extractEventUpdate(claudeResponse);

  // 7. Persist: append messages + apply event update
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

  await persistConversation(event.id, history.messages, newMessages, eventUpdate);

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
  context: { userId: number; tenantId: number }
) {
  if (input.eventId) {
    const event = await prisma.event.findFirst({
      where: { id: input.eventId, tenantId: context.tenantId },
    });
    if (!event) throw new Error("Event not found");
    return event;
  }

  // Create a new draft event
  return prisma.event.create({
    data: {
      tenantId: context.tenantId,
      creatorId: context.userId,
      title: "New incident",
      status: "DRAFT",
      contentType: input.messageType === "text" ? "TEXT" : input.messageType === "audio" ? "AUDIO" : "IMAGE",
      conversationHistory: { messages: [] },
    },
  });
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

async function getRAGContext(query: string, tenantId: number): Promise<string> {
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch {
    // If embedding API is unavailable, degrade gracefully — agent still works without RAG
    return "";
  }

  const vector = embeddingToSql(queryEmbedding);

  // Search resolved incident KB
  const kbResults = await prisma.$queryRaw<Array<{
    problem_text: string;
    solution_text: string;
    similarity: number;
  }>>`
    SELECT problem_text, solution_text,
           1 - (problem_embedding <=> ${vector}::vector) AS similarity
    FROM knowledge_base
    WHERE tenant_id = ${tenantId}
      AND problem_embedding IS NOT NULL
    ORDER BY problem_embedding <=> ${vector}::vector
    LIMIT 5
  `;

  // Search factory doc chunks (manuals, procedures)
  const docResults = await prisma.$queryRaw<Array<{
    content: string;
    doc_name: string;
    similarity: number;
  }>>`
    SELECT fdc.content, fd.name as doc_name,
           1 - (fdc.embedding <=> ${vector}::vector) AS similarity
    FROM factory_doc_chunks fdc
    JOIN factory_docs fd ON fd.id = fdc.doc_id
    WHERE fdc.tenant_id = ${tenantId}
      AND fdc.embedding IS NOT NULL
    ORDER BY fdc.embedding <=> ${vector}::vector
    LIMIT 3
  `;

  const SIM_THRESHOLD = 0.70;
  const relevantKb  = kbResults.filter((r) => r.similarity > SIM_THRESHOLD);
  const relevantDoc = docResults.filter((r) => r.similarity > SIM_THRESHOLD);

  if (relevantKb.length === 0 && relevantDoc.length === 0) return "";

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
        .map(
          (r, i) =>
            `[Fragmento ${i + 1} de "${r.doc_name}" — similitud: ${(r.similarity * 100).toFixed(0)}%]\n${r.content}`
        )
        .join("\n\n")
    );
  }

  return parts.join("\n\n");
}

function buildSystemPrompt(tenantName: string, ragContext: string): string {
  const contextSection = ragContext
    ? `\nBASE DE CONOCIMIENTO — Casos similares resueltos en ${tenantName}:\n${ragContext}\n`
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
- Cuando el operador confirme que una opción funcionó (ej: "Funcionó la opción 1", "anduvo", "se resolvió"), respondé confirmando la resolución y marcá el evento como resuelto

BLOQUE META — incluilo AL FINAL de cada respuesta, nunca lo muestres al operador:
[[META|status:STATUS|priority:PRIORITY|machine:NOMBRE_MAQUINA|resolved:BOOL]]
- status: draft | open | in_progress | resolved
- priority: low | medium | high | critical
- machine: nombre o código de la máquina (null si no se sabe)
- resolved: true solo cuando el operador confirmó que la solución funcionó
Ejemplo: [[META|status:in_progress|priority:high|machine:COMP-005|resolved:false]]`;
}

async function callClaude(
  systemPrompt: string,
  history: { messages: ConversationMessage[] },
  userMessage: string
): Promise<string> {
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
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

function extractEventUpdate(rawResponse: string): {
  cleanResponse: string;
  eventUpdate: EventUpdate | undefined;
} {
  const metaRegex = /\[\[META\|(.*?)\]\]/;
  const match = rawResponse.match(metaRegex);

  if (!match) {
    return { cleanResponse: rawResponse.trim(), eventUpdate: undefined };
  }

  const cleanResponse = rawResponse.replace(match[0], "").trim();
  const pairs = match[1].split("|");
  const meta: Record<string, string> = {};

  for (const pair of pairs) {
    const [key, value] = pair.split(":");
    if (key && value && value !== "null") meta[key.trim()] = value.trim();
  }

  const eventUpdate: EventUpdate = {};
  if (meta.status) eventUpdate.status = meta.status.toUpperCase() as EventUpdate["status"];
  if (meta.priority) eventUpdate.priority = meta.priority.toUpperCase() as EventUpdate["priority"];
  if (meta.machine) eventUpdate.machineName = meta.machine;
  if (meta.resolved === "true") eventUpdate.resolved = true;

  return { cleanResponse, eventUpdate };
}

async function persistConversation(
  eventId: number,
  existingMessages: ConversationMessage[],
  newMessages: ConversationMessage[],
  eventUpdate: EventUpdate | undefined
) {
  const allMessages = [...existingMessages, ...newMessages];

  const updateData: Parameters<typeof prisma.event.update>[0]["data"] = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conversationHistory: { messages: allMessages } as any,
    updatedAt: new Date(),
  };

  if (eventUpdate) {
    if (eventUpdate.status) updateData.status = eventUpdate.status;
    if (eventUpdate.priority) updateData.priority = eventUpdate.priority;
    if (eventUpdate.machineName) updateData.machineName = eventUpdate.machineName;
    if (eventUpdate.location) updateData.location = eventUpdate.location;

    if (eventUpdate.resolved) {
      updateData.status = "RESOLVED";
      updateData.resolvedAt = new Date();

      const lastAssistant = [...newMessages].reverse().find((m) => m.role === "assistant");
      if (lastAssistant) {
        updateData.solution = lastAssistant.content;

        // Create KB entry + embedding (fire and forget — don't block response)
        const event = await prisma.event.findUnique({
          where: { id: eventId },
          select: { problemContent: true, tenantId: true },
        });

        if (event) {
          createKBEntryWithEmbedding({
            tenantId: event.tenantId,
            eventId,
            problemText: event.problemContent ?? "Incident",
            solutionText: lastAssistant.content,
          }).catch((err) => console.error("[KB creation failed]", err));
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
  const entry = await prisma.knowledgeBase.create({
    data: { tenantId, eventId, problemText, solutionText, effectivenessScore: 7 },
    select: { id: true },
  });

  const embedding = await generateEmbedding(problemText);
  const vector = embeddingToSql(embedding);

  await prisma.$executeRaw`
    UPDATE knowledge_base
    SET problem_embedding = ${vector}::vector
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
