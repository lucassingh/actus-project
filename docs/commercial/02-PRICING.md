# 02 — Pricing Model

## B2B SaaS — Per-tenant subscription

Target: industrial plants in Argentina (initially), expanding to LATAM.

## Tiers (reference — subject to change)

| Tier | Price | Operators | Events/month | Knowledge Base |
|---|---|---|---|---|
| Basic | TBD | Up to 10 | Up to 500 | Yes |
| Pro | TBD | Unlimited | Unlimited | Yes + Doc ingestion |

## Cost structure (with new Vercel + Neon + Claude stack)

Reference scenario: 8 operators, ~10 queries/day each = 2,400 queries/month

| Component | Cost/month |
|---|---|
| Vercel (Hobby → Pro when needed) | $0–20 |
| Neon PostgreSQL (free tier) | $0 |
| Claude Haiku API (~2,400 queries × 2K tokens) | ~$1.20 |
| Anthropic embeddings | ~$0.01 |
| **Total at MVP scale** | **< $25/month** |

Previous stack (AWS Lightsail + n8n + Gemini) was ~$62/month for same usage.

## Billing note

Claude API billing is separate from the $20/month Claude.ai subscription.
API credits needed separately from console.anthropic.com.
At MVP usage levels, $5–10 in API credits lasts months.
