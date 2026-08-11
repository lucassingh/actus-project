# 01 — MVP Scope

## Product

**Actus** — Intelligent incident management system for industrial facilities.

B2B SaaS, multi-tenant. Operators report incidents via mobile (text, audio, image). An AI agent (Claude) diagnoses, suggests solutions, and builds a knowledge base from resolved cases.

## Target users

- **Operators**: Field workers who report incidents from the plant floor via mobile
- **Supervisors**: Team leads who monitor all incidents in their facility
- **Admins**: Actus platform admins who manage which companies are on the platform

## MVP feature set (v2)

### Mobile (actus-app — Expo)
- [x] Login / session management (Clerk)
- [x] Create incident (text message)
- [x] Create incident (audio message)
- [x] Create incident (image)
- [x] Chat with AI agent per incident
- [x] View incident history
- [ ] Push notifications (post-MVP)

### Dashboard (apps/web — Next.js)
- [x] Supervisor: view all incidents for their tenant
- [x] Supervisor: filter by status, priority, machine
- [x] Supervisor: view conversation history per incident
- [x] Supervisor: manage operators (invite, deactivate)
- [x] Admin: manage tenants (create, activate, deactivate)
- [ ] Analytics / reports (post-MVP)

### Agent (apps/web — AgentService)
- [x] Process text messages
- [x] Process audio (Claude multimodal)
- [x] Process images (Claude vision)
- [x] RAG from knowledge base (pgvector)
- [x] Auto-create KB entry when incident resolved
- [ ] Document ingestion (factory manuals) — post-MVP

## Out of scope for MVP

- Mobile push notifications
- Advanced analytics / charts
- Document upload for knowledge base (factory manuals)
- Multi-language support (Spanish only for now)
- White-labeling

## Pricing model (reference)

See `docs/commercial/02-PRICING.md`

## First client

Essen (pilot) — industrial plant in Argentina.
Reference: `docs/commercial/03-PILOT-essen.md`
