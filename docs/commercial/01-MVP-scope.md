# 01 — MVP Scope

> Actualizado 2026-10-02: el producto migró de app mobile (Expo) a **WhatsApp**. La app
> mobile fue eliminada. Ver `docs/technical/08-WHATSAPP-integration.md`.

## Product

**Actus** — Intelligent incident management system for industrial facilities.

B2B SaaS, multi-tenant. Operators report incidents via **WhatsApp** (text, audio, image). An AI agent (Claude) diagnoses, suggests solutions, and builds a knowledge base from resolved cases plus the plant's uploaded manuals.

## Target users

- **Operators**: Field workers who report incidents from the plant floor **via WhatsApp** (no app to install, no login — identified by phone number).
- **Supervisors**: Team leads who monitor all incidents in their facility (web dashboard, Clerk auth).
- **Admins**: Actus platform admins who manage which companies are on the platform.

## MVP feature set

### WhatsApp (operators)
- [x] Identify operator by phone number (registered by their supervisor — no Clerk account)
- [x] Report incident (text message)
- [x] Report incident (audio message) — transcribed with Whisper (requires OpenAI credit)
- [x] Report incident (image) — Claude vision
- [x] Conversational diagnosis with the AI agent per incident
- [x] Conversation continuity (reuses the operator's open incident; new one once resolved)

### Dashboard (apps/web — Next.js)
- [x] Supervisor: view all incidents for their tenant
- [x] Supervisor: filter by status, priority, machine
- [x] Supervisor: view conversation history per incident
- [x] Supervisor: register/manage operators (by WhatsApp number)
- [x] Supervisor: upload factory manuals (PDF) to the knowledge base
- [x] Admin: manage tenants (create, list) and supervisors
- [ ] Analytics / KPIs dashboard (post-MVP — ver auditoría, feature F3)

### Agent (apps/web — AgentService)
- [x] Process text messages
- [x] Process audio (OpenAI Whisper — Claude has no audio input)
- [x] Process images (Claude vision)
- [x] RAG from resolved-incident knowledge base (pgvector)
- [x] RAG from uploaded factory manuals (pgvector) — **implementado, con limitaciones conocidas** (ver `docs/TODO.md` → P1: truncado a 80 chunks, sin OCR, chunking ingenuo)
- [x] Auto-create KB entry when incident resolved
- [x] Off-topic guardrail

## Out of scope for MVP

- Automatic payment / billing (MercadoPago) — ver `docs/commercial/03-PILOT-essen.md`: el piloto va con alta manual, sin cobro. Se implementa post-piloto con KPIs.
- Advanced analytics / charts (post-MVP — feature F3 de la auditoría)
- OCR for scanned manuals (post-MVP — pero recomendado, ver TODO P1)
- Multi-language support (Spanish only for now)
- White-labeling

## Pricing model (reference)

See `docs/commercial/02-PRICING.md`

## First client

Essen (pilot) — cookware manufacturer in Argentina.
Reference: `docs/commercial/03-PILOT-essen.md`
