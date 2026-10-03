# 01 — Agent Architecture

## Overview

The agent is the core feature of Actus. It receives messages from operators (text, audio, or image) and responds intelligently using a RAG pipeline backed by the knowledge base accumulated from resolved incidents.

This replaces the previous n8n + Gemini workflow entirely.

## Flow

```
Operator's WhatsApp                    (legacy: Mobile App)
  │                                             │
  │ POST /api/v1/whatsapp/webhook               │ POST /api/v1/agent/message
  │ (Meta payload — see                         │ { eventId?, messageType, content, file? }
  │  08-WHATSAPP-integration.md)                │
  ▼                                             ▼
                    AgentService.processMessage()
  │
  ├─ 1. extractText() — apps/web/src/services/agent.service.ts
  │     text   → use as-is
  │     audio  → OpenAI Whisper transcription (lib/transcription.ts) — NOT Claude.
  │              Claude's Messages API has no audio content-block; a `document`
  │              block only accepts media_type "application/pdf" (confirmed
  │              against the live API, see 08-WHATSAPP-integration.md).
  │     image  → Claude API (vision) — this one is native and correct
  │
  ├─ 2. getRAGContext(text, tenantId) — pgvector cosine, tenant-isolated, threshold 0.70
  │     → top 5 similar past incidents (knowledge_base.problem_embedding)
  │     → top 3 manual fragments (factory_doc_chunks.embedding)
  │     → both are injected into the system prompt (empty string if OpenAI/embeddings unavailable)
  │
  ├─ 3. Build system prompt
  │     → role + tenant context
  │     → RAG results formatted as context
  │     → conversation history (last N turns)
  │
  ├─ 4. Claude API: claude-haiku (fast, cheap)
  │     → streaming response
  │
  ├─ 5. extractEventUpdate(response)
  │     → parse [[META|...]] block from response
  │     → detect resolution signals
  │     → build EventUpdate object
  │
  └─ 6. Persist
        → append to Event.conversationHistory
        → if resolved: create KnowledgeBase entry + generate embedding
        → return { response, eventUpdate }
```

## Models used

| Use case | Model | Reason |
|---|---|---|
| Text/image response | `claude-haiku-4-5-20251001` | Fast, cheap, sufficient for operator queries |
| Audio transcription | `whisper-1` (OpenAI) | Claude has no audio input modality — see above |
| Embeddings (RAG + manuals) | `text-embedding-3-small` (OpenAI, 1536d) | Matches the pgvector(1536) columns |

> Manual ingestion (`factory-doc.service.ts`) uses **no LLM** — it is `pdf-parse` (text
> extraction, no OCR) + word-based chunking + embeddings. There is no Sonnet call anywhere in
> the current code. Hardening this pipeline is tracked in `docs/TODO.md` → P1.

## System prompt structure

```
You are an industrial maintenance assistant for [tenant.name].
Your job is to help operators diagnose and resolve equipment incidents.

KNOWLEDGE BASE CONTEXT:
[top 5 similar past incidents with their solutions]

CONVERSATION HISTORY:
[last N messages]

Rules:
- Respond in Spanish
- Always suggest 2-3 concrete actions
- If the operator confirms a solution worked, mark the event as resolved
- Include [[META|status:X|priority:Y|machine:Z]] at the end of your response
```

## META block format

Gemini/n8n used a custom META block to return structured data alongside the response text. We keep this pattern with Claude:

```
[[META|status:in_progress|priority:high|machine:Pump A3|resolved:false]]
```

The `extractEventUpdate()` function strips this from the visible response and maps it to `EventUpdate`.

## Knowledge base (RAG)

Two vector sources, both searched on every message in `getRAGContext()`:

1. **Resolved incidents** — `knowledge_base.problem_embedding`, top 5. Entry created automatically
   when an event is resolved (fire-and-forget embedding of the problem text).
2. **Factory manuals** — `factory_doc_chunks.embedding`, top 3. Supervisors upload PDFs in
   `/dashboard/factory-docs`; `factory-doc.service.ts` chunks + embeds them.

- Embeddings: `text-embedding-3-small` (OpenAI, 1536d).
- Search: pgvector cosine similarity, tenant-isolated (`WHERE tenant_id = ?`), similarity threshold 0.70.
- Degradation: if the embedding API is unavailable, `getRAGContext()` returns `""` and the agent
  still answers (without RAG) — this is silent, so an expired/empty OpenAI key looks like "the bot
  ignores the manuals".

> ⚠️ Known limitations of the manual pipeline (see `docs/TODO.md` → P1): capped at 80 chunks
> (long manuals truncated), no OCR (scanned PDFs rejected), naive word-chunking (breaks tables),
> synchronous ingestion, no reranking, `pageNum` not populated (no page citations).

## Cost estimate (MVP)

- ~2,000 tokens per interaction (input + output)
- claude-haiku: $0.25/1M input + $1.25/1M output
- 1,000 interactions/month ≈ $0.75
- Embeddings for 1,000 KB entries ≈ $0.01

Total for active MVP: **under $2/month**
