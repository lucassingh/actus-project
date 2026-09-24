# 05 — Testing del circuito completo

Guía paso a paso para verificar que todo el sistema funciona de punta a punta: plataforma web + WhatsApp + agente.

> El operador ya no usa una mobile app — ver [`08-WHATSAPP-integration.md`](08-WHATSAPP-integration.md).
> El nivel 3 de esta guía prueba el flujo real (WhatsApp), no la app Expo legacy.

## Prerequisitos

Tener corriendo:
```bash
cd actus && npm run dev
```

Variables de entorno necesarias en `apps/web/.env.local`:
```
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...            ← sin esto el RAG y la transcripción de audio no funcionan
WHATSAPP_ACCESS_TOKEN=...     ← System User token permanente, no el temporal de 24hs
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_APP_SECRET=...
WHATSAPP_VERIFY_TOKEN=...
```

Para probar el webhook de WhatsApp hace falta una URL pública (deploy a Vercel, o un
túnel tipo ngrok apuntando a `localhost`) — Meta no puede pegarle a `localhost` directo.

---

## Nivel 1 — Actus admin (vos, dueño de la plataforma)

### 1.1 Crear la cuenta de admin

1. Ir a [dashboard.clerk.com](https://dashboard.clerk.com)
2. En Users → seleccionar tu usuario
3. Editar `publicMetadata` → poner `{ "actusAdmin": true }`
4. Ir a `localhost:3001/dashboard`
5. El sidebar debería mostrar **Empresas**, **Supervisores**, **Base de Conocimiento** (sin Operadores ni Eventos — esos son del supervisor)

> Si ves "Operadores" y "Eventos" en lugar de "Empresas", cerrá sesión y volvé a entrar para que el token se refresque.

---

## Nivel 2 — Supervisor (dueño de la empresa cliente)

### 2.1 Crear una organización en Clerk

1. Ir a [dashboard.clerk.com](https://dashboard.clerk.com) → Organizations → **Create organization**
2. Nombre: `Essen` (o el nombre de la empresa cliente)
3. Slug: `essen`
4. Agregar al supervisor como `org:admin` en esa organización

### 2.2 Primer login del supervisor

1. Ir a `localhost:3001/sign-in`
2. Loguearse con la cuenta del supervisor
3. **Resultado esperado**: el sistema auto-crea el registro en Prisma:
   - `Tenant` con `name: "Essen"` y `clerkOrgId: org_xxx`
   - `User` con `role: "SUPERVISOR"` y `tenantId` vinculado al tenant
4. El sidebar debería mostrar: **Dashboard**, **Operadores**, **Eventos**, **Documentos**, **Base de Conocimiento**

### 2.3 Registrar un operador

1. Ir a **Operadores → Nuevo operador** (requiere rol exacto SUPERVISOR — un ADMIN no puede entrar a esta página)
2. Completar nombre, apellido, y número de WhatsApp en formato internacional sin `+`
   (ej: `5493462565888` — código de país + 9 para celulares argentinos + característica sin el 0 + número sin el 15)
3. Click en **Crear operador**
4. **Resultado esperado**: se crea el `User` en Prisma inmediatamente (`role: "OPERATOR"`, `clerkUserId: null`, `phoneNumber` seteado) — no se manda ningún email ni invitación
5. La página redirige a `/dashboard/operators?created=1`

---

## Nivel 3 — Operador (trabajador de planta)

### 3.1 Escribirle al bot

No hay invitación que aceptar ni app que instalar. Apenas el supervisor completa el
Nivel 2.3, el operador ya puede escribirle directamente al número de WhatsApp de Actus.

1. Desde el WhatsApp del operador (el mismo número que cargó el supervisor), mandar un mensaje de texto al número de Actus
2. **Resultado esperado**:
   - El webhook (`POST /api/v1/whatsapp/webhook`) recibe el mensaje
   - Encuentra el `User` por `phoneNumber` (match exacto contra `message.from`)
   - Le llega una respuesta del agente al mismo chat de WhatsApp

Si en cambio llega "Tu número no está registrado en Actus" — el número que cargó el
supervisor en el Nivel 2.3 no coincide exactamente con el que está usando el operador
(revisar el formato: sin `+`, con el `9` para Argentina).

### 3.2 Verificar que el supervisor ve al operador

1. El supervisor (en el dashboard web) va a **Operadores**
2. **Resultado esperado**: aparece el operador recién registrado en la lista, con su número de WhatsApp

---

## Nivel 4 — Flujo de incidente completo

### 4.1 Crear incidente (WhatsApp)

1. Operador le escribe al bot de WhatsApp: `"El horno HORNO-001 en Planta 1 Sector 2 subió la temperatura bruscamente a 320°C"`
2. **Resultado esperado**:
   - El sistema crea un evento `INCIDENT` con status `OPEN` en la DB
   - El agente responde con 2-3 opciones numeradas de resolución
   - Si hay casos similares en la KB (y hay OpenAI API key), el agente los menciona

### 4.2 Iteración de resolución

1. El operador responde: `"Probé la opción 1, funcionó"`
2. **Resultado esperado**:
   - El agente detecta la confirmación
   - El evento se actualiza a `status: "RESOLVED"`
   - Se crea o actualiza una entrada en `KnowledgeBaseEntry` con el problema y la solución

### 4.3 Verificar en el dashboard

1. El supervisor abre el dashboard → **Eventos**
2. **Resultado esperado**: el evento aparece con status `Resuelto`
3. Click en el evento → se abre el detalle
4. **Resultado esperado**: se ve toda la conversación con el agente (burbuja por burbuja)

---

## Nivel 5 — RAG (incidente similar al anterior)

> Requiere `OPENAI_API_KEY` configurada. Sin ella el agente funciona pero no busca en historial.

1. El operador crea un **nuevo evento** con un síntoma similar: `"HORNO-001 temperatura alta"`
2. **Resultado esperado**: el agente responde mencionando el caso anterior resuelto, sugiriendo primero la misma solución que funcionó

---

## Nivel 6 — Guardrails del agente

1. En cualquier evento activo, el operador escribe: `"¿A qué hora juega Argentina hoy?"`
2. **Resultado esperado**: el agente responde ÚNICAMENTE: `"Solo puedo asistirte con incidentes y mantenimiento de equipos de [nombre de la empresa]."`
3. Sin agregar nada más, sin disculparse ni explicar más.

---

## Nivel 7 — Audio e imagen

### Audio
1. Operador manda una nota de voz por WhatsApp: `"El compresor COMP-005 hace un ruido extraño al arrancar"`
2. **Resultado esperado**: el agente responde sobre el compresor

Internamente esto pasa por `downloadWhatsAppMedia()` → `transcribeAudio()` (Whisper de
OpenAI) → el texto transcripto recién ahí entra al flujo normal de `AgentService`. **No**
es Claude el que transcribe — su API no tiene modalidad de audio (ver
[`08-WHATSAPP-integration.md`](08-WHATSAPP-integration.md)). Si no llega respuesta,
revisar que `OPENAI_API_KEY` tenga crédito cargado — sin crédito, Whisper falla con
`429 insufficient_quota`/`no credits remaining`.

### Imagen
1. Operador manda una foto por WhatsApp (simulando una foto del problema)
2. **Resultado esperado**: el agente describe lo que ve en la imagen y contextualiza con el incidente abierto — esta parte sí es Claude nativo (vision), sin pasos intermedios.

---

## Checklist de verificación rápida

| Ítem | ✅ / ❌ |
|---|---|
| Supervisor se loguea y se auto-crea en Prisma | |
| Supervisor puede registrar operadores por WhatsApp | |
| Operador le escribe al bot y recibe respuesta (sin instalar nada) | |
| Supervisor ve al operador en la lista | |
| Operador puede crear un evento de texto | |
| Agente responde en español con opciones numeradas | |
| Operador confirma resolución y el evento pasa a RESOLVED | |
| Supervisor ve el evento y su historial en el dashboard | |
| Agente rechaza preguntas fuera de mantenimiento | |
| Agente sugiere casos similares (requiere OpenAI key) | |
| Audio funciona (transcripción por Whisper) | |
| Imagen funciona (descripción por Claude) | |
| Webhook responde el handshake de Meta (`GET` con `hub.challenge`) | |

---

## Troubleshooting frecuente

| Problema | Causa probable | Solución |
|---|---|---|
| "Tu número no está registrado en Actus" | El `phoneNumber` cargado por el supervisor no matchea exactamente el `from` que manda WhatsApp | Revisar formato: sin `+`, con el `9` de celular argentino |
| Webhook nunca recibe nada (`GET` funciona, ningún `POST` en los logs) | La WABA no está suscripta a nuestra app | `POST /{WABA_ID}/subscribed_apps` con el access token — ver 08-WHATSAPP-integration.md |
| `401` en el `GET` del webhook | Clerk middleware bloqueando la ruta | Confirmar que `/api/v1/whatsapp/webhook` está en `isPublicRoute` de `middleware.ts` |
| Build de Vercel no falla pero el webhook tira error de credencial undefined | Turborepo saca las env vars no declaradas | Agregar las 4 `WHATSAPP_*` a `turbo.json` → `tasks.build.env` |
| `(#131030) Recipient phone number not in allowed list` | Restricción de sandbox — número no verificado, o inestabilidad conocida de Meta | Reverificar en Destinatario → Administrar lista de números. Si persiste sin cambios de config, es un problema del lado de Meta, no nuestro — considerar acelerar la verificación de negocio |
| Token deja de funcionar cada 24hs | Se está usando el token temporal del botón "Generar identificador" | Cambiar a un token de System User permanente — ver 08-WHATSAPP-integration.md |
| Agente no busca en historial | Sin OpenAI API key (o sin crédito) | Cargar `OPENAI_API_KEY` con crédito en `.env.local` — también rompe la transcripción de audio, no solo el RAG |
| Factory docs da error | ~~FactoryDoc no estaba en schema~~ | Ya corregido — página es estática |
| Sidebar no muestra ítems de Admin | Token no tiene metadata | Cerrar sesión y volver a entrar |
