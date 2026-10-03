# Actus — TODO / Estado

Estado al **2026-10-02** (post-auditoría). Arquitectura: **WhatsApp + dashboard web Next.js**, desplegada en Vercel (`actus-project-web.vercel.app`, auto-deploy desde `main`). La app mobile (Expo) fue eliminada — ver `docs/technical/08-WHATSAPP-integration.md`.

---

## ✅ Ya funciona (no reescribir salvo para mejorar)

| Feature | Estado |
|---|---|
| Webhook WhatsApp (HMAC, dedupe `wamid`, ack rápido) | ✅ |
| Procesamiento durable con Inngest (reintentos 3, throttle 15/min por operario, concurrency 1, Sentry) | ✅ |
| Agente: texto + imagen (visión, Claude Haiku) | ✅ |
| Agente: audio (Whisper `whisper-1`) | ✅ código / ⏳ requiere crédito OpenAI |
| Guardrail off-topic | ✅ |
| RAG de incidentes resueltos (`knowledge_base`) | ✅ (requiere OpenAI key) |
| RAG de manuales PDF (`factory_doc_chunks`) | ✅ (con limitaciones — ver P1) |
| Upload de PDFs en dashboard (`/dashboard/factory-docs`) | ✅ |
| Límite de mensajes por evento (`MAX_EVENT_MESSAGES=40`) | ✅ (reemplaza el viejo P0 "límite de iteraciones") |
| Dashboard: eventos (lista/detalle/filtros), KB | ✅ |
| Dashboard: alta de operarios (supervisor → `phoneNumber`, sin Clerk) | ✅ |
| Dashboard admin: crear/listar tenants y supervisores | ✅ (era P2, ya hecho) |
| Multi-tenancy (Clerk Orgs = Tenants) | ✅ |
| Deploy en Vercel | ✅ (era P1, ya hecho) |

---

## 🔴 P0 — Bloqueantes del piloto

1. **Crédito OpenAI** → `OPENAI_API_KEY` con saldo en `apps/web/.env.local` + Vercel. Sin esto: no hay embeddings (el RAG degrada a vacío de forma silenciosa) ni Whisper (audio). Texto e imagen funcionan igual.
2. **Verificación de empresa en Meta** (depende de regularizar monotributo) → salir del número sandbox (+1 555 660 8866, lista blanca de 5 números, bug `131030`). **Para el piloto en Essen el sandbox alcanza**; esto es para abrir a producción real.
3. **16 vulnerabilidades npm** (1 crítica, 10 high) reportadas tras `npm install` → correr `npm audit` y resolver lo que corresponda antes de producción.

---

## 🟠 P1 — Robustez del RAG de manuales (prioridad técnica #1)

Hoy el RAG de manuales es más demo que productivo (ver auditoría 2026-10-02):

- `MAX_CHUNKS = 80` **trunca manuales largos** — se indexa solo ~15-40% de un manual de 150-400 págs, y el resto se descarta en silencio.
- **Sin OCR**: un PDF escaneado (foto de páginas) tira "no tiene texto extraíble".
- **Chunking por conteo de palabras** rompe tablas (torques, códigos de error, repuestos) y procedimientos.
- **Ingesta síncrona** en server action (80 embeddings en serie) → riesgo de timeout. Mover a **Inngest** (ya está en el stack) con progreso.
- **Query = mensaje crudo del operario** (corto/coloquial) embebe mal contra el manual formal; umbral 0.70 alto; sin reescritura/HyDE ni **reranking**.
- No se llena `pageNum` → el bot **no puede citar página**.

## 🟠 P2 — Robustez del agente

- Reemplazar el parsing por regex del bloque `[[META|...]]` por **tool use / Zod structured outputs** (patrón de agrodata `packages/ai`).
- **Feedback loop**: `effectivenessScore` queda hardcodeado en 7 y `timesReferenced` nunca sube → la KB no aprende qué sirve.
- **Escalamiento a supervisor** cuando el bot no resuelve o la prioridad es crítica.
- **Idempotencia**: un reintento de `process-agent-message` puede crear un Event duplicado.
- **Primeros tests unitarios** (hoy no hay ninguno).

## 🟡 P3 — UX / pulido / landing

- Verificar loading state en upload de PDFs (`/dashboard/factory-docs`) — el procesamiento tarda 10-60s.
- `error.tsx` en `apps/web/src/app/dashboard/` para crashes amigables.
- **Rediseño de la landing**: unificar en un solo sistema de diseño (el del Hero). Ver `docs/technical/UI/landing/ui-landing.md`.

---

## Archivos clave

| Qué buscar | Dónde está |
|---|---|
| Agente (Claude + RAG) | `apps/web/src/services/agent.service.ts` |
| Ingesta de PDFs (manuales) | `apps/web/src/services/factory-doc.service.ts` |
| Embeddings (OpenAI) | `apps/web/src/lib/embeddings.ts` |
| Transcripción (Whisper) | `apps/web/src/lib/transcription.ts` |
| Webhook WhatsApp | `apps/web/src/app/api/v1/whatsapp/webhook/route.ts` |
| Envío/descarga media WhatsApp | `apps/web/src/services/whatsapp.service.ts` |
| Procesamiento durable | `apps/web/src/inngest/functions/process-whatsapp-message.ts` |
| Schema de DB | `apps/web/prisma/schema.prisma` |
| Variables de entorno | `apps/web/.env.local` (no está en git) |
| Integración WhatsApp (gotchas) | `docs/technical/08-WHATSAPP-integration.md` |
| Playbook de infra | `docs/technical/09-INFRA-PLAYBOOK.md` |
