# Actus V2 — TODO para producción

Estado al 29/06/2026. Todo lo del MVP core está implementado. Lo que sigue es para dejarlo deployable y operable sin intervención manual.

---

## 🔴 P0 — Hacer primero (30 min en total)

### 1. Agregar OpenAI API key
```
apps/web/.env.local → OPENAI_API_KEY=sk-...
```
Sin esto el RAG no funciona (el agente trabaja pero no busca en historial ni en manuales).

### 2. Rate limit en el endpoint del agente
**Archivo:** `apps/web/src/app/api/v1/agent/message/route.ts`  
Agregar un check antes de llamar al agente: máximo N requests por usuario por minuto.
Opción simple: usar `upstash/ratelimit` (gratis tier) o un check en DB por ventana de tiempo.

### 3. Límite de iteraciones por evento
**Archivo:** `apps/web/src/services/agent.service.ts` → función `persistConversation`  
Agregar antes de procesar:
```typescript
const MSG_LIMIT = 30;
if (history.messages.length >= MSG_LIMIT) {
  throw new Error("Este evento alcanzó el límite de mensajes. Cerralo y abrí uno nuevo.");
}
```
Retornar ese error al mobile con status 422 y mostrar mensaje al operador.

---

## 🟠 P1 — Deploy (necesario para salir de localhost)

### 4. Deploy apps/web en Vercel
1. `vercel login` → conectar repo
2. Configurar variables de entorno en Vercel dashboard:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
3. Configurar dominio (ej: `app.actus.com.ar`)
4. Verificar que `apps/landing` apunte a la URL de producción

### 5. Actualizar URL base en la mobile
**Archivo:** `actus-app/src/utils/constants.ts`
```typescript
// Cambiar esto:
const API_HOST = '192.168.1.35';  // IP local
const API_PORT = '3001';

// Por esto (después del deploy):
export const API_BASE_URL = 'https://tu-app.vercel.app/api/v1';
```
Idealmente usar una variable de entorno de Expo (`EXPO_PUBLIC_API_URL`).

### 6. EAS Build — app Android para distribución interna
```bash
cd actus-app
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```
Genera un `.apk` que se instala directo en el celular sin Play Store.
Referencia: https://docs.expo.dev/build/introduction/

---

## 🟠 P2 — Admin pages (onboarding de clientes sin ir a Clerk/Prisma)

Hoy para dar de alta un cliente nuevo hay que:
- Ir a Clerk → crear org manualmente
- Ir a Prisma Studio → crear Tenant

Con estas páginas lo hace el admin desde el dashboard:

### 7. `/dashboard/tenants` — lista de todas las empresas
**Archivo a crear:** `apps/web/src/app/dashboard/tenants/page.tsx`  
Query: `prisma.tenant.findMany()` (solo ADMIN ve esta página)  
Mostrar: nombre, código, plan, cantidad de operadores, fecha de creación

### 8. `/dashboard/tenants/create` — crear empresa nueva
**Archivo a crear:** `apps/web/src/app/dashboard/tenants/create/page.tsx`  
Server Action que:
1. Crea Org en Clerk (`clerkClient().organizations.createOrganization(...)`)
2. Invita al supervisor como `org:admin`
3. Crea `Tenant` en Prisma con el `clerkOrgId`

### 9. `/dashboard/supervisors` — lista de supervisores
**Archivo a crear:** `apps/web/src/app/dashboard/supervisors/page.tsx`  
Query: `prisma.user.findMany({ where: { role: "SUPERVISOR" } })` — todos los tenants

---

## 🟡 P3 — UX y docs

### 10. Loading state en upload de PDFs
**Archivo:** `apps/web/src/app/dashboard/factory-docs/page.tsx`  
El form necesita un Client Component con estado `isUploading` para mostrar spinner.
Actualmente el supervisor no ve feedback durante los 10-60 seg del procesamiento.
Solución: extraer el form a un `"use client"` component con `useFormStatus()` de React.

### 11. Error boundaries en el dashboard
Agregar `error.tsx` en `apps/web/src/app/dashboard/` para que los crashes muestren un mensaje amigable en vez de la pantalla de error de Next.js.

### 12. `docs/technical/06-DEPLOYMENT.md`
Documentar el proceso completo de deploy: Vercel + EAS + variables de entorno + configuración de Clerk para producción.

---

## Estado actual del sistema (qué YA funciona)

| Feature | Estado |
|---|---|
| Auth web (Clerk dashboard) | ✅ |
| Auth mobile (Clerk Expo) | ✅ |
| Multi-tenancy (Clerk Orgs = Tenants) | ✅ |
| Invitar operadores desde dashboard | ✅ |
| Agente: texto / audio / imagen | ✅ |
| Guardrail off-topic | ✅ |
| RAG desde incidentes resueltos | ✅ (requiere OpenAI key) |
| RAG desde manuales PDF | ✅ (requiere OpenAI key) |
| Upload de PDFs en dashboard | ✅ |
| Dashboard: lista de eventos | ✅ |
| Dashboard: detalle de evento + conversación | ✅ |
| Dashboard: lista de operadores | ✅ |
| Mobile: lista de eventos + filtros | ✅ |
| Mobile: crear evento (chat con agente) | ✅ |
| Mobile: detalle de evento | ✅ |
| Super admin (Actus owners) | ✅ via Clerk publicMetadata |
| Admin: crear/listar tenants | ❌ P2 |
| Admin: crear/listar supervisors | ❌ P2 |
| Rate limiting | ❌ P0 |
| Límite iteraciones/evento | ❌ P0 |
| Deploy Vercel | ❌ P1 |
| EAS Build Android | ❌ P1 |

---

## Para arrancar mañana

El orden más lógico:
1. Poner la `OPENAI_API_KEY` → testear que el RAG funcione subiendo un PDF
2. Agregar rate limit + límite de iteraciones (30 min)
3. Deploy en Vercel
4. EAS Build del .apk
5. Admin pages si ya hay un segundo cliente que dar de alta

---

## Archivos clave para orientarse

| Qué buscar | Dónde está |
|---|---|
| Agente (Claude + RAG) | `apps/web/src/services/agent.service.ts` |
| Ingesta de PDFs | `apps/web/src/services/factory-doc.service.ts` |
| Embeddings (OpenAI) | `apps/web/src/lib/embeddings.ts` |
| Auth context (mobile) | `actus-app/src/context/AuthContext.tsx` |
| API base URL (mobile) | `actus-app/src/utils/constants.ts` |
| Schema de DB | `apps/web/prisma/schema.prisma` |
| Variables de entorno | `apps/web/.env.local` (no está en git) |
| Plan de implementación original | `docs/technical/07-IMPLEMENTATION-plan.md` |
| Testing del circuito | `docs/technical/05-TESTING-circuit.md` |
