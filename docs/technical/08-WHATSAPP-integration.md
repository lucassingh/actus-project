# 08 — WhatsApp Integration

## Why

The mobile app (Expo) required an APK build/distribution pipeline, app store friction, and
per-device install/update overhead for a userbase (factory floor operators) that already has
WhatsApp installed. Operators now report incidents by messaging a WhatsApp number directly —
no app to install, no login, no update cycle. Supervisors and admins still use the web
dashboard (Clerk auth) unchanged.

## Flow

```
Operator's WhatsApp
  │ text / voice note / photo
  ▼
Meta Cloud API (WhatsApp Business Platform)
  │ POST webhook
  ▼
apps/web/src/app/api/v1/whatsapp/webhook/route.ts
  │
  ├─ GET  → Meta's verification handshake (hub.challenge)
  │
  └─ POST → 1. Validate X-Hub-Signature-256 (HMAC-SHA256 with WHATSAPP_APP_SECRET)
             2. Look up User by phoneNumber (message.from)
             3. buildAgentInput() — text as-is; audio/image → downloadWhatsAppMedia()
             4. findActiveEventId() — reuse the operator's open incident, or let
                AgentService create a new draft (same rule the mobile app enforced
                client-side by holding eventId in the chat screen's state — WhatsApp
                has no client state, so the webhook does this lookup itself)
             5. processAgentMessage() — same AgentService as before, untouched
             6. sendWhatsAppMessage() — reply via Graph API
```

`AgentService.processMessage()` itself does not know or care about WhatsApp — the webhook is
purely a transport adapter in front of it. (The mobile app and its `/api/v1/agent/message`
route were removed; the webhook is now the only caller.)

## Ack first, then process — and dedupe retries

Meta retries any webhook it doesn't get a fast 200 for, and delivers at-least-once anyway.
Running Claude (and Whisper) before answering made slow replies arrive twice. The route now:
1. Records each message's `wamid` in `whatsapp_inbound_messages` (primary key) — a
   redelivered message is a no-op insert (`createMany` + `skipDuplicates`) and is skipped.
2. Returns 200 immediately and runs steps 2–6 above inside Next's `after()`, which keeps the
   Vercel function alive until the reply is sent.

## Auth model change

Operators no longer have Clerk accounts. `User.clerkUserId` became optional
(`String?`) and `User.phoneNumber` (`String?`, unique) was added — see
[`02-DATA-model.md`](02-DATA-model.md). A User row can now be identified by
**either** `clerkUserId` (supervisors/admins, dashboard) **or** `phoneNumber`
(operators, WhatsApp) — never both at once in practice.

`apps/web/src/middleware.ts` excludes `/api/v1/whatsapp/webhook` from the Clerk
session check — Meta will never send a Clerk session, and the endpoint is secured
by its own HMAC signature validation instead.

## Audio: Whisper, not Claude

Claude's Messages API has no audio content-block — confirmed against the live API
(a `document` block only accepts `media_type: "application/pdf"`; there is no
`"audio"` type in the SDK). `apps/web/src/lib/transcription.ts` transcribes audio via
OpenAI Whisper (`whisper-1`) before handing text to Claude. This applies to both the
WhatsApp voice-note path and any pre-existing audio path in `AgentService.extractText()`.

## Conversation continuity

WhatsApp has no concept of "the current screen" the way the mobile app's chat UI did.
`findActiveEventId()` in the webhook route looks up the operator's most recent event
with status `DRAFT`, `OPEN`, or `IN_PROGRESS` and reuses it; only once that incident is
`RESOLVED`/`CLOSED` does the next message start a new one.

## Environment variables (`apps/web/.env.local` + Vercel + `turbo.json`)

```
WHATSAPP_ACCESS_TOKEN      # System User permanent token (see below) — never the 24h temp token
WHATSAPP_PHONE_NUMBER_ID   # numeric ID, NOT the phone number itself
WHATSAPP_APP_SECRET        # App Dashboard → Settings → Basic
WHATSAPP_VERIFY_TOKEN      # arbitrary string we invent, pasted into Meta's webhook config
```

**Must also be added to `turbo.json` → `tasks.build.env`**, or Turborepo silently strips
them from the Vercel build and every WhatsApp call fails with an undefined credential at
runtime — this is the same gotcha that previously hit `DATABASE_URL`/`CLERK_SECRET_KEY`.

## Access token: use a System User token, not the 24h dashboard token

The "Generate access token" button on the WhatsApp API Setup screen produces a **temporary
token that expires in 24h and gets invalidated every time you regenerate one** — fine for a
five-minute manual test, unusable for a deployed webhook. The permanent alternative:

1. business.facebook.com → Configuración del negocio → Usuarios → **Usuarios del sistema**
2. Select (or create) a System User → **Asignar activos** → assign both:
   - **Aplicaciones**: the app (full access)
   - **Cuentas de WhatsApp**: the WABA (full access)

   Both asset types must be assigned separately — assigning only one leaves the token
   generator showing "No hay permisos disponibles".
3. **Generar nuevo identificador** → select the app → check
   `whatsapp_business_messaging` + `whatsapp_business_management` → Generate.

This token has `expires_at: 0` (verifiable via `GET /debug_token`) and doesn't need to be
touched again.

## Sandbox-only gotcha: recipient allow-list

Test/unverified WhatsApp Business numbers can only send to phone numbers explicitly
verified via **Destinatario → Administrar lista de números de teléfono** (OTP code) in the
same API Setup screen. This restriction:
- Is **not** satisfied by picking a number from that same dropdown for the page's own
  "Enviar mensaje" test button — that's a separate, cosmetic selection.
- Observed to be **flaky**: sending succeeded twice, then failed with
  `(#131030) Recipient phone number not in allowed list` on the third attempt with
  no configuration change in between. This looks like instability on Meta's sandbox
  backend, not something fixable from our side.
- Goes away entirely once the WABA completes Meta Business verification and moves off
  the sandbox test number — no allow-list applies to a verified production number.

## Deploying a webhook code change

Steps 3–6 all live in the same Vercel project as the dashboard
(`actus-project-web`, https://actus-project-web.vercel.app). The project is connected to
GitHub: every push to `main` deploys to production automatically — no manual
`vercel deploy` needed.

Check delivery with `npx vercel logs actus-project-web.vercel.app --scope lucas-singhs-projects` —
a clean run shows `info`-level `POST /api/v1/whatsapp/webhook` lines (the message, plus
Meta's sent/delivered/read status events, which are ignored); an `error`-level line with
`[whatsapp.service] sendWhatsAppMessage failed` or `handleIncomingMessage failed` means the reply
didn't go out (check the error body — usually either an expired temp token or the sandbox
allow-list issue above).

## Webhook configuration and the shared test WABA

The Meta app `actus` (app id `1692778191800002`) points its webhook at
`https://actus-project-web.vercel.app/api/v1/whatsapp/webhook`. It can be read or changed
without the dashboard, using the app token `<app_id>|<WHATSAPP_APP_SECRET>`:
`GET/POST https://graph.facebook.com/v21.0/1692778191800002/subscriptions`.

The test WABA (`2059836461282766`, number +1 555 660 8866) is **shared with another app,
`agrodata-bot`**. Meta delivers every event of a WABA to all subscribed apps, so a message to
the test number reaches both bots. The webhook ignores any event whose
`metadata.phone_number_id` isn't `WHATSAPP_PHONE_NUMBER_ID`. That protects production (one
number per bot); on the shared test number both bots still answer the same message. For
production, use one WABA + one phone number per bot under the same Business portfolio.

## Registering an operator

`apps/web/src/app/dashboard/operators/create/page.tsx` — supervisor enters name +
WhatsApp number (international format, no `+`, e.g. `5493462565888` for an Argentine
mobile). Creates a `User` row directly (`role: OPERATOR`, `clerkUserId: null`,
`email: ""`) — no Clerk invitation, no app install. Requires exact role `SUPERVISOR`
(same restriction that already applied to the old email-invite flow — an ADMIN cannot
access this page).

## What's explicitly out of scope here

- Meta Business verification (manual, external — legal business documents, 2–10
  business days). Sandbox test mode (5 recipient numbers, allow-list restriction above)
  is sufficient for the pilot.
- WhatsApp message-cost accounting. Service-window replies are free until **2026-09-30**;
  from **2026-10-01** Meta starts charging per service message at the same rate as
  utility/authentication templates for the recipient's country (~USD 0.026/msg in
  Argentina as of this writing — Meta publishes final country rates 2026-09-01).

## PENDING — first end-to-end test with the pilot supervisor (scheduled Saturday 2026-09-26)

Done before that date: production deployed at https://actus-project-web.vercel.app, Meta
webhook pointed at it and verified, webhook filtered by `phone_number_id`.

Checklist, to be done together with the supervisor (Lucas's friend, pilot contact):

1. [ ] **Admin (Lucas)** → dashboard → Supervisores → Crear → tenant **Essen Pilot** →
       supervisor's email. He accepts the Clerk invitation and picks his password.
2. [ ] **Meta (Lucas)** → app `actus` → Casos de uso → Conectar en WhatsApp → Paso 1. Probar →
       Destinatario → *Administrar lista de números* → add the supervisor's number. The OTP
       arrives on **his** WhatsApp — he has to read it to Lucas. Lucas's own number is
       already on the list.
3. [ ] **Supervisor** → Operadores → Crear → two operators:
       - himself, with his WhatsApp number (digits only, `549` + area code + number)
       - Lucas, `5493462565888` (optional)
       A person can be both supervisor (email/Clerk) and operator (phone): separate `User` rows.
4. [ ] Both send a WhatsApp to **+1 555 660 8866**, e.g. "Se trabó la cinta 3". Expect the agent's
       reply within seconds and a new incident in `/dashboard/events` (supervisor view).
5. [ ] Watch `npx vercel logs actus-project-web.vercel.app --scope lucas-singhs-projects` during the test.

Known risks for that test:
- **`agrodata-bot` may also reply**, since it shares the test number — ignore it or stop it
  during the test.
- **Error `131030`**: Meta stores Lucas's number on the allow-list as `54346215565888` (legacy
  format with `15`, no `9`), while incoming messages arrive as `549...`. If the reply fails
  with 131030, the send path needs to normalize Argentine numbers.
- **Audio** needs OpenAI credit (Whisper). Text and photos work without it.
