# 03 — Pilot Client: Essen

## Overview

Essen is an industrial plant in Argentina. First pilot client for Actus.

## Context

- Industry: Industrial plant (Argentina)
- Team size: ~8 operators
- Usage: ~10 queries/day per operator
- Language: Spanish (es-AR)

## Pilot scope

- Mobile app for operators (Expo React Native)
- Agent chat: text, audio, image incident reporting
- Supervisor dashboard: event monitoring and operator management
- Knowledge base: auto-built from resolved incidents

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
