# 09 — Playbook de infraestructura multi-entorno (replicable)

Receta paso a paso para montar la infra profesional (prod + test/develop + local) que se
armó en Actus, pensada para **replicarla en otro proyecto** (ej. agrodata). Stack asumido:
**Next.js (App Router) + Prisma + Neon (Postgres) + Vercel + Clerk**, y opcional
**Inngest** (procesamiento async durable) + **Sentry** (errores).

> Escrito como guía de setup desde cero. Para el "cómo trabajar en el día a día" una vez
> montado, ver [`06-ENVIRONMENTS-and-workflow.md`](06-ENVIRONMENTS-and-workflow.md).

---

## 0. Arquitectura objetivo

| | Código (git) | Vercel | Base (Neon) | Clerk | Inngest |
|---|---|---|---|---|---|
| **Prod** | `main` | Production | branch `production` | instancia Production (con dominio) | env Production |
| **Test** | `develop` | Preview | branch `develop` | instancia Development | dev server / branch env |
| **Local** | cualquiera | `npm run dev` | branch `develop` | instancia Development | dev server (`inngest-cli dev`) |

Reglas de oro:
- **Schema sube** (dev→prod) por migraciones. **Datos bajan** (prod→develop) por reset de branch Neon. Nunca al revés.
- **Una llave por entorno**, no por app: las keys de Neon/Inngest son por environment, compartidas por lo que viva ahí.
- **Local nunca apunta a prod.**

Orden recomendado de ejecución: **1 (migraciones) → 2 (Neon) → 3 (Vercel) → 4 (git) → 5 (Inngest) → 6 (Sentry)**.

---

## 1. Prisma: pasar de `db push` a migraciones (baseline)

Con dos entornos, `db push` es inmanejable. Hay que introducir historial de migraciones
**sin recrear** las tablas existentes ("baseline").

1. Config de la CLI en `apps/web/prisma.config.ts` — que migre por conexión **directa**:
   ```ts
   function migrationUrl(): string | undefined {
     const explicit = process.env["DIRECT_URL"];
     if (explicit && /^postgres(ql)?:\/\//i.test(explicit)) return explicit;
     const pooled = process.env["DATABASE_URL"];
     if (!pooled) return undefined;
     try {
       const u = new URL(pooled);
       u.host = u.host.replace("-pooler", "");      // Neon: directo = pooled sin -pooler
       u.searchParams.delete("pgbouncer");
       u.searchParams.delete("connection_limit");
       return u.toString();
     } catch { return pooled; }
   }
   // datasource: { url: migrationUrl() }
   ```
   👉 **Derivar la directa desde `DATABASE_URL` es clave** (ver gotcha #1): hace el setup a
   prueba de una `DIRECT_URL` mal cargada.
2. Generar la migración base a partir del schema actual (NO toca la DB):
   ```bash
   mkdir -p prisma/migrations/0_init
   npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script \
     --output prisma/migrations/0_init/migration.sql
   ```
   Revisar que incluya `CREATE EXTENSION` de lo que uses (ej. `vector` para pgvector).
3. Marcar la base como "ya aplicada" (NO ejecuta el SQL, solo escribe `_prisma_migrations`):
   ```bash
   npx prisma migrate resolve --applied 0_init
   npx prisma migrate status   # -> "Database schema is up to date!"
   ```
   Hacer esto **contra la base actual (prod)** ANTES de branchear en Neon → el branch nuevo
   hereda el baseline.
4. Scripts en `package.json`: `"db:deploy": "prisma migrate deploy"` (aplica pendientes en
   prod). `db:migrate` (= `migrate dev`) queda para desarrollo local.

---

## 2. Neon: branches production + develop

Neon tiene branching copy-on-write nativo.

1. El branch actual (con los datos) es **`production`** (renombralo si querés claridad).
2. **New Branch** → nombre `develop`, parent `production`, "Current point in time" →
   hereda datos + schema + `_prisma_migrations` + extensiones.
3. ⚠️ **Quitarle la expiración** al branch nuevo (gotcha #2), sino se autodestruye.
4. Copiar la connection string **pooled** (con `-pooler`) de cada branch → van a `DATABASE_URL`.
   La directa la deriva la config (paso 1), no hace falta cargarla aparte.

**Sync de datos prod→develop** (para reproducir bugs): Neon → develop → *Reset from parent*.
Pisa los datos de develop (son descartables). Si develop tenía migraciones que prod no,
re-aplicarlas con `db:deploy` después.

---

## 3. Vercel: env vars por entorno + build command

1. **Env vars** (Settings → Environment Variables). Regla: **una entrada por (nombre +
   entorno)**, no se pueden solapar (gotcha #3). Para tener valores distintos por entorno,
   achicá primero la existente a un solo entorno y después creás la del otro.
   ```
   DATABASE_URL → Production = production pooled
   DATABASE_URL → Preview    = develop pooled
   ```
   (`DIRECT_URL` no hace falta si usás la derivación del paso 1. Si la cargás igual, que sea
   la directa correcta — pooling OFF en Neon.)
   - Ignorar el entorno **Development** de Vercel (es solo para `vercel dev`; local usa `.env.local`).
   - Vars nuevas del build → declararlas también en `turbo.json → tasks.build.env` (gotcha #4).
2. **Build Command** (Settings → Build & Development): correr migraciones antes de buildear.
   Si usás Turborepo, **no** metas el migrate en un task de turbo (te filtra la env);
   usá npm plano:
   ```
   npm run db:deploy && turbo run build
   ```
   ⚠️ Activarlo recién cuando `main` ya tenga el script `db:deploy` (o sea, en/después de la
   primera promoción), sino un deploy de prod desde `main` viejo falla.

---

## 4. git: flujo y branch protection

- Ramas: `main` (=prod, protegida) · `develop` (=integración/test) · `feat/…`,`fix/…` (trabajo).
- Flujo: rama de trabajo ← `develop` → PR a `develop` (Preview) → PR **`develop` → `main`**
  (deploy prod + `migrate deploy` automático).
- ⚠️ **Dirección del PR** (gotcha #5): en GitHub **base = a dónde va (`main`)**, **compare =
  de dónde viene (`develop`)**. Invertirlo mergea main→develop y prod no recibe nada.
- **Branch protection** en `main`: require PR before merging, 0 approvals (si trabajás solo).
- ⚠️ Un **build fallido NO se promueve** (gotcha #6): Vercel deja vivo el último deploy
  bueno. Si prod "no cambió", revisá que el build del merge no haya fallado.

---

## 5. Inngest (opcional — procesamiento async durable)

Reemplaza el `after()` de Next (que pierde el mensaje en silencio si falla) por ejecución
durable con reintentos por step + `onFailure`.

1. Deps: `inngest` (+ `zod` para tipar el evento). Archivos:
   `src/inngest/client.ts` (`new Inngest({ id: "<app>" })`), `src/inngest/events.ts`
   (`eventType("<name>", { schema })`), `src/inngest/functions/*.ts`, y el endpoint
   `src/app/api/inngest/route.ts` (`serve({ client, functions })`).
2. **Middleware**: `/api/inngest(.*)` tiene que ser **público** (lo autentica la signing key
   de Inngest, no la sesión de auth). Si no, devuelve redirect a login y el sync falla (gotcha #7).
3. ⚠️ **Nombre de evento único por app** (gotcha #8): si varias apps viven en el mismo
   environment de Inngest, un evento con el mismo nombre dispara TODAS las funciones que
   matcheen. Namespacealo: `"<app>/whatsapp.message.received"`.
4. Estructura de la app en Inngest: **Cuenta → Environment → Apps**. No creás keys por app;
   las keys (Event Key + Signing Key) son **por environment** (Keys en el dashboard).
   Un proyecto nuevo = una **App nueva** en el mismo environment (aparece al sincronizar).
5. Env vars: `INNGEST_DEV=1` en local (usa el dev server, sin keys);
   `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` en Vercel **Production** (declararlas en `turbo.json`).
   No reusar las de Production en Preview (mezclarías runs) — Preview usa branch env aparte o
   se prueba local.
6. **Sync** (registrar la URL): **DESPUÉS de deployar** (el endpoint tiene que estar vivo).
   Inngest → Apps → Sync new app → Sync manually → `https://<dominio-prod>/api/inngest`.
7. Controles útiles en `createFunction`: `retries`, `concurrency: { key: "event.data.<x>" }`
   (serializa por usuario), `throttle` (rate limit sin infra extra), `onFailure` (avisar +
   Sentry).
8. Local: `npx inngest-cli@latest dev -u http://localhost:<port>/api/inngest`.

---

## 6. Sentry (opcional — monitoreo de errores)

1. Dep: `@sentry/nextjs`. Archivos (en `src/` si usás src dir):
   `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`, y
   `instrumentation.ts` (con `register()` + `export const onRequestError = Sentry.captureRequestError`).
   Todos con `enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)` → **apagado sin DSN**.
2. `next.config.ts`: envolver con `withSentryConfig` **solo si hay `SENTRY_AUTH_TOKEN`**
   (el token es solo para subir source maps; opcional).
3. ⚠️ **No corras el wizard** (`npx @sentry/wizard`) si ya hiciste la config a mano: te la pisa.
4. Env vars: `NEXT_PUBLIC_SENTRY_DSN` en Vercel (tipo **Config**, no Secret — es público, va al
   navegador — gotcha #9). Auth token/org/project solo si querés source maps.
5. Capturar donde importe, con contexto: ej. en el `onFailure` de Inngest
   `Sentry.captureException(error, { tags, extra })`.

---

## Gotchas (los que realmente pegamos)

1. **P1013 "scheme not recognized"** en el build: `DIRECT_URL`/`DATABASE_URL` mal pegada
   (comillas, formato "psql", prefijo `VAR=`). Fix robusto: derivar la directa desde
   `DATABASE_URL` en `prisma.config.ts` (paso 1) e ignorar una `DIRECT_URL` inválida.
2. **Branch de Neon con expiración**: sacale la fecha o se borra solo.
3. **Vercel: una entrada por (nombre+entorno)**: no podés tener dos `DATABASE_URL` que
   pisen el mismo entorno; achicá la vieja primero.
4. **Turborepo filtra env vars**: toda var del build tiene que estar en `turbo.json → build.env`.
5. **Dirección del PR**: base=`main`, compare=`develop` para promover.
6. **Build fallido no promueve**: prod queda en el último deploy bueno.
7. **`/api/inngest` detrás del auth**: hay que excluirlo del middleware o el sync falla.
8. **Colisión de nombre de evento** entre apps del mismo environment de Inngest: namespacear.
9. **`NEXT_PUBLIC_*` como "Secret" en Vercel**: da warning; es público → ponelo como "Config".
10. **Migrate por pooled (PgBouncer)**: rompe (advisory locks). Siempre por conexión directa.

---

## Checklist rápido de replicación (para agrodata u otro)

- [ ] `prisma.config.ts` deriva la directa desde `DATABASE_URL`
- [ ] Baseline `0_init` + `migrate resolve --applied` contra prod
- [ ] Neon: branch `develop` desde `production`, sin expiración
- [ ] Vercel: `DATABASE_URL` por entorno (Prod=production, Preview=develop)
- [ ] Vercel Build Command: `npm run db:deploy && turbo run build`
- [ ] git: rama `develop`, branch protection en `main`
- [ ] `.env.local` local → apunta a `develop`
- [ ] (Inngest) evento namespaceado, `/api/inngest` público, keys en Prod, sync post-deploy
- [ ] (Sentry) DSN en Vercel como Config, config a mano (sin wizard)
- [ ] Doc del proyecto actualizada (equivalente a este 09 + al 06)
