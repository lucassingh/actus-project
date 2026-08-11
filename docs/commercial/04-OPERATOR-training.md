# 04 — Operator Training Guide

Condensed from the full guide created during the Essen pilot.

## What the agent does

- Reports incidents (text, audio, image)
- Searches past resolved cases (knowledge base RAG)
- Suggests 2-3 ordered solutions
- Closes the event when the operator confirms a solution worked

## Minimum viable incident report (what to always include)

1. **Machine name/code** — e.g. `HORNO-001`, `TOR-033`, `COMP-005`
2. **Location** — e.g. `Planta 1 Sector 2`
3. **Symptom description** — specific, not vague ("temperature dropped to 150°C" not "it broke")

Optional but helpful:
- Priority (alta / media / baja)
- Photo or audio of the problem

## Resolution flow

1. Agent proposes numbered solutions: "1. Check thermostat 2. Inspect heating element..."
2. Operator tries them in order
3. Operator confirms: **"Funcionó la opción 1"** (exact phrase the agent recognizes)
4. Event is auto-closed, solution saved to knowledge base

## Common operator mistakes to address in onboarding

- Vague messages: "no funciona" → remind to include machine + location + symptom
- Forgetting machine code → they need codes posted physically near machines
- Not confirming resolution → remind that confirming teaches the system

## Agent boundaries (off-topic detection)

The agent is configured to only answer maintenance-related questions.
Non-maintenance queries ("what's the weather") are rejected politely.

## Message types

| Type | How | When to use |
|---|---|---|
| Text | Type message | Quick reports, confirmation |
| Audio | Hold mic button, speak | Hands busy, faster than typing |
| Image | Camera or gallery | Visual damage, error screens, gauges |
