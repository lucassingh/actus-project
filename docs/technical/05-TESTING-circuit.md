# 05 — Testing del circuito completo

Guía paso a paso para verificar que todo el sistema funciona de punta a punta: plataforma web + mobile + agente.

## Prerequisitos

Tener corriendo:
```bash
# Terminal 1 — monorepo (web + landing)
cd actus-v2 && npm run dev

# Terminal 2 — mobile (en otra terminal)
cd actus-app && npx expo start
```

Variables de entorno necesarias en `apps/web/.env.local`:
```
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...   ← sin esto el RAG no funciona, el resto sí
```

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

### 2.3 Invitar un operador

1. Ir a **Operadores → Nuevo operador**
2. Ingresar el email del operador (ej: `operador@essen.com`)
3. Click en **Enviar invitación**
4. **Resultado esperado**: el operador recibe un email de Clerk con un link para unirse a la organización Essen
5. La página redirige a `/dashboard/operators?invited=1`

---

## Nivel 3 — Operador (trabajador de planta)

### 3.1 Aceptar la invitación

1. El operador abre el email de Clerk y hace click en el link
2. Crea su contraseña (o usa Google si está configurado)
3. Queda como `org:member` de la organización Essen en Clerk

### 3.2 Primer login en la mobile app

> La mobile apunta a `192.168.1.35:3001` — verificar que la IP sea la de tu máquina con `ipconfig` y actualizar `actus-app/src/utils/constants.ts` si cambió.

1. Abrir la app Expo en el celular
2. Ingresar el email y contraseña del operador
3. **Resultado esperado**:
   - La app llama a `/api/v1/auth/me`
   - El sistema auto-crea el `User` en Prisma con `role: "OPERATOR"` y el `tenantId` de Essen
   - El operador ve la pantalla de inicio con KPIs en 0

### 3.3 Verificar que el supervisor ve al operador

1. El supervisor (en el dashboard web) va a **Operadores**
2. **Resultado esperado**: aparece el operador recién logueado en la lista

---

## Nivel 4 — Flujo de incidente completo

### 4.1 Crear incidente (mobile)

1. Operador en la app → click en el **botón flotante (+)**
2. Se abre la pantalla de chat del agente
3. Escribir un mensaje de texto: `"El horno HORNO-001 en Planta 1 Sector 2 subió la temperatura bruscamente a 320°C"`
4. Click en enviar
5. **Resultado esperado**:
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
1. En la pantalla de chat, mantener presionado el botón de micrófono
2. Hablar: `"El compresor COMP-005 hace un ruido extraño al arrancar"`
3. Soltar el botón
4. **Resultado esperado**: el agente transcribe el audio (Claude multimodal) y responde sobre el compresor

### Imagen
1. Click en el ícono de cámara
2. Sacar foto de cualquier cosa (simular una foto del problema)
3. **Resultado esperado**: el agente describe lo que ve en la imagen y contextualiza con el incidente abierto

---

## Checklist de verificación rápida

| Ítem | ✅ / ❌ |
|---|---|
| Supervisor se loguea y se auto-crea en Prisma | |
| Supervisor puede invitar operadores | |
| Operador acepta invitación y se loguea en la mobile | |
| Supervisor ve al operador en la lista | |
| Operador puede crear un evento de texto | |
| Agente responde en español con opciones numeradas | |
| Operador confirma resolución y el evento pasa a RESOLVED | |
| Supervisor ve el evento y su historial en el dashboard | |
| Agente rechaza preguntas fuera de mantenimiento | |
| Agente sugiere casos similares (requiere OpenAI key) | |
| Audio funciona (transcripción por Claude) | |
| Imagen funciona (descripción por Claude) | |

---

## Troubleshooting frecuente

| Problema | Causa probable | Solución |
|---|---|---|
| Mobile no conecta | IP incorrecta | Verificar `constants.ts` con `ipconfig` |
| "Sin organización de Clerk" en invite | El supervisor no tiene Clerk org | Crear org en dashboard.clerk.com |
| Supervisor ve "Operadores" pero está vacío | El operador no hizo login en mobile | El operador debe loguearse primero en la app |
| Agente no busca en historial | Sin OpenAI API key | Agregar `OPENAI_API_KEY` en `.env.local` |
| Factory docs da error | ~~FactoryDoc no estaba en schema~~ | Ya corregido — página es estática |
| Sidebar no muestra ítems de Admin | Token no tiene metadata | Cerrar sesión y volver a entrar |
