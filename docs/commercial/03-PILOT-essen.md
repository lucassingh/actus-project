# 03 — Pilot Client: Essen

## Overview

Essen is an industrial plant in Argentina. First pilot client for Actus.

## Context

- Industry: Industrial plant (Argentina)
- Team size: ~8 operators
- Usage: ~10 queries/day per operator
- Language: Spanish (es-AR)

## Pilot scope

- **WhatsApp** for operators (no app to install — report by messaging the Actus number)
- Agent chat: text, audio, image incident reporting
- Supervisor dashboard: event monitoring and operator management
- Knowledge base: auto-built from resolved incidents + uploaded factory manuals

## Modelo del piloto (decisión 2026-10-02)

- **Sin pago automático (MercadoPago).** El piloto valida producto y saca KPIs, no monetiza.
- **Alta manual:** el admin (Lucas) da de alta un **supervisor**; el supervisor da de alta a sus
  **operarios** (pantalla `dashboard/operators/create`, por número de WhatsApp). Sin checkout.
- El **pago automático** se implementa recién post-piloto, con KPIs y abriendo a público fuera de Essen.
  Referencia de implementación: agrodata (`packages/core/src/billing`).
- Bloqueante aparte para producción real: regularizar **monotributo** para completar la verificación de
  empresa en Meta y salir del número sandbox de WhatsApp.

## Test users (dev/staging only — DO NOT commit to production)

Reference: `actus-project/docs/agent_essen.txt` (kept in old repo, not migrated — contains dev credentials)

Admin, supervisor and operator test accounts exist for QA purposes.
For production, all users are created via Clerk Organization invitations.

## Key learnings from pilot

- Operators need very clear prompts — training guide exists: see `04-OPERATOR-training.md`
- Audio messages are heavily used (operators prefer speaking over typing on the plant floor)
- Machine name + location + symptom = minimum viable incident report
- Supervisors want quick status overview (open / in_progress / resolved counts)
- Knowledge base effectiveness increases significantly after ~20 resolved incidents per machine type

## Logo assets

- `actus-project/docs/logo-essen-b.png` — Essen logo (dark)
- `actus-project/docs/logo-essen-s.png` — Essen logo (light)
