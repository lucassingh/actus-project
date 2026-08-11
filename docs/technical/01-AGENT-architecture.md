# 01 — Agent Architecture

## Overview

The agent is the core feature of Actus. It receives messages from operators (text, audio, or image) and responds intelligently using a RAG pipeline backed by the knowledge base accumulated from resolved incidents.

This replaces the previous n8n + Gemini workflow entirely.

## Flow

```
Mobile App
  │
  │ POST /api/v1/agent/message
  │ { eventId?, messageType, content, file? }
  │
  ▼
AgentService.processMessage()
  │
  ├─ 1. processInput()
  │     text   → use as-is
  │     audio  → Claude API (audio understanding)
  │     image  → Claude API (vision)
  │
  ├─ 2. KnowledgeBaseService.search(text, tenantId)
  │     → pgvector cosine similarity on problem_embedding
  │     → returns top 5 similar past incidents + solutions
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
| Text/audio/image response | `claude-haiku-4-5-20251001` | Fast, cheap, sufficient for operator queries |
| Complex document analysis | `claude-sonnet-4-6` | Only for admin-initiated doc processing |

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

- Embeddings generated via `text-embedding-3-small` (OpenAI, $0.02/1M tokens) or via Neon's built-in embedding support
- Stored in `KnowledgeBase.problem_embedding` (pgvector `vector(1536)`)
- Search: cosine similarity with tenant isolation
- Entry created automatically when an event is resolved

## Cost estimate (MVP)

- ~2,000 tokens per interaction (input + output)
- claude-haiku: $0.25/1M input + $1.25/1M output
- 1,000 interactions/month ≈ $0.75
- Embeddings for 1,000 KB entries ≈ $0.01

Total for active MVP: **under $2/month**
