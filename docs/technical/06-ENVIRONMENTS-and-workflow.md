# 06 — Entornos y flujo de trabajo profesional

Cómo está montada la infraestructura de Actus en **dos entornos** (producción + test) y
el flujo de trabajo que hay que respetar para no romper prod. Escrito para trabajar solo
hoy, pero con la disciplina de un equipo.

> Regla mental que resume todo: **el schema sube (dev → prod), los datos bajan
> (prod → develop). Nunca al revés.**

---

## 1. Los entornos

| | Código (git) | Vercel | Base (Neon) | Clerk |
|---|---|---|---|---|
| **Producción** | rama `main` | deployment **Production** | branch `production` | instancia **Development** * |
| **Test** | rama `develop` | deployment **Preview** | branch `develop` | instancia **Development** |
| **Local** | cualquier rama | `npm run dev` | branch `develop` | instancia **Development** |

- **Local NO usa Docker ni una base propia**: `next dev` pega directo al branch `develop` de Neon.
- **Local y prod NUNCA comparten base**: local escribe sobre `develop`, prod sobre `production`.
- \* Clerk todavía usa una sola instancia (Development) para todo. La separación a una
  instancia **Production** (`pk_live_`) está **diferida** porque requiere un dominio propio
  (ver §11).

### Cómo mapea Vercel los entornos

| Entorno Vercel | Se usa cuando… | ¿Lo usamos? |
|---|---|---|
| **Production** | deploy de la rama `main` | sí (prod) |
| **Preview** | deploy de cualquier otra rama / PR (incluida `develop`) | sí (test) |
| **Development** | solo con `vercel dev` (CLI) | **no** — local va por `.env.local` |

Cada push a `develop` (o a una rama con PR) genera un **Preview**. Vercel da una URL estable
por rama: `actus-project-web-git-develop-....vercel.app` → esa es la URL fija de test.

---

## 2. Las dos formas de "mantener las bases al día"

Son **independientes**. Confundirlas es el error clásico.

### Flujo A — SCHEMA (sube: dev → prod)
Los cambios de estructura viajan **con el código**, vía migraciones de Prisma. Ver §5 y §8.

### Flujo B — DATOS (baja: prod → develop)
Para reproducir un bug con datos reales: se **resetea `develop` desde `production`** en Neon.
Ver §9.

---

## 3. Variables de entorno

### En Vercel (Settings → Environment Variables)
Cada variable vive **por entorno**. Regla: **una sola entrada puede tocar cada entorno**
(si una ya agarra Preview, no podés crear otra que también agarre Preview — primero achicás
la vieja). Estado esperado de las variables de base:

```
DATABASE_URL → Production   = production pooled     (host con -pooler)
DATABASE_URL → Preview      = develop pooled
DIRECT_URL   → Production   = production directo     (host sin -pooler)
DIRECT_URL   → Preview      = develop directo
```

El resto (Clerk, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `WHATSAPP_*`) aplican a
Production + Preview con el mismo valor, por ahora.

### `DATABASE_URL` vs `DIRECT_URL` (por qué existen las dos)
- **`DATABASE_URL`** (pooled, host con `-pooler`): la usa la **app en runtime**
  (`src/lib/prisma.ts`, vía el adapter de Neon). Pooling = maneja bien muchas conexiones
  serverless.
- **`DIRECT_URL`** (directo, host sin `-pooler`): la usa **solo la CLI de Prisma**
  (migraciones), configurado en `prisma.config.ts`. El endpoint *pooled* de Neon (PgBouncer)
  **rompe** las migraciones (advisory locks / DDL multi-statement), por eso migramos por la
  directa.

### En local (`apps/web/.env.local`, NO se commitea)
```
DATABASE_URL="<develop pooled>"     # runtime de la app
DIRECT_URL="<develop directo>"      # CLI/migraciones
```
La directa se deriva de la pooled sacándole `-pooler` del host (y quitando `pgbouncer=true`).

> ⚠️ **turbo.json**: toda env var nueva que necesite el build debe estar en
> `turbo.json → tasks.build.env`, o Turborepo la borra del build de Vercel y la app falla en
> runtime con credencial `undefined`. Ya están declaradas `DATABASE_URL` y `DIRECT_URL`.

---

## 4. Setup local (una sola vez)

1. `apps/web/.env.local` con `DATABASE_URL` + `DIRECT_URL` apuntando a **develop**.
2. `npm install` (raíz del monorepo).
3. `npm run dev` → `localhost:3001`, escribiendo sobre la base `develop`.

---

## 5. Flujo de trabajo diario (git)

Modelo de ramas:

```
main     = production  (protegida; solo se toca por PR desde develop)
develop  = integración / test  (deploys Preview)
fix/…, feat/…  = ramas de trabajo, salen de develop
```

### Feature o fix normal
```bash
git checkout develop && git pull          # partir de develop actualizado
git checkout -b feat/mi-cambio            # rama de trabajo

# ... editar código ...
# si toca la DB (ver §8):
npm run db:migrate -- --name mi_cambio    # crea la migración y la aplica en develop

git add -A && git commit -m "feat: ..."
git push -u origin feat/mi-cambio
# abrir PR  ->  develop     (Vercel genera un Preview de la PR)
# verificar en el Preview, luego mergear a develop
```

Se juntan varias cosas en `develop` así, y se prueban todas juntas en el Preview de `develop`.

### Promoción a producción
Cuando `develop` está estable:
```
abrir PR:  develop  ->  main
mergear
```
Al mergear a `main`, Vercel deploya **Production** y (con el Build Command configurado, §10)
corre `prisma migrate deploy` → **aplica automáticamente en `production` las migraciones que le
falten**. `migrate deploy` solo aplica lo pendiente, nunca resetea ni borra.

---

## 6. Caso completo: bug full-stack en prod (incluye DB + migración)

El escenario típico, paso a paso:

1. `git checkout develop && git pull`
2. `git checkout -b fix/descripcion-del-bug`
3. Corregís el código. Cambia el schema → editás `apps/web/prisma/schema.prisma`.
4. `npm run db:migrate -- --name descripcion_del_bug`
   → genera `apps/web/prisma/migrations/<timestamp>_descripcion_del_bug/` **y** lo aplica a la
   base `develop`. Probás local (que pega a develop).
5. Commit **incluyendo el archivo de migración** + push + **PR a `develop`**.
6. Verificás en el Preview de la PR. Merge a `develop`.
7. Cuando quieras publicar: **PR `develop` → `main`** → merge.
8. El deploy de prod aplica la migración **solo** (`migrate deploy`). No hacés nada a mano en
   la base de producción. ✅

> Si el bug es urgente y no querés esperar a juntar cosas en develop, igual pasa por develop:
> hacés el fix, PR a develop, y en seguida PR develop→main. El camino es el mismo, solo más
> rápido. **Nunca commitees directo a `main`.**

---

## 7. (reservado)

---

## 8. Migraciones — chuleta

| Situación | Comando | Contra qué base |
|---|---|---|
| Cambié el schema, quiero migrar en dev | `npm run db:migrate -- --name X` | develop (tu `.env.local`) |
| Aplicar migraciones pendientes en prod | `npm run db:deploy` | la que apunte `DIRECT_URL` (lo corre Vercel en el build de prod) |
| Ver estado de migraciones | `npx prisma migrate status` (en `apps/web`) | la de `DIRECT_URL` |
| Abrir la base visualmente | `npm run db:studio` | la de `DIRECT_URL` |

- **`db:migrate`** (= `prisma migrate dev`): crea el archivo de migración y lo aplica. Solo en
  desarrollo, contra develop.
- **`db:deploy`** (= `prisma migrate deploy`): aplica migraciones ya creadas, sin generar nada.
  Es lo que corre en producción al deployar. Idempotente y seguro.
- **Baseline**: la migración `0_init` es el schema que existía cuando pasamos de `db push` a
  migraciones. Está marcada como "ya aplicada" en `production` y `develop` (heredado por el
  branch). No la borres.
- **No usar `db push`** de acá en adelante en estos entornos (rompe el historial). Es solo para
  prototipos descartables.

---

## 9. Sync de datos: reproducir un bug de prod en develop

Cuando prod tiene datos que necesitás para reproducir un bug:

```
Neon → Branches → develop → "Reset from parent" (production)
```
`develop` pasa a ser una **copia fresca de production** (datos actuales). Instantáneo
(copy-on-write).

**Advertencias:**
1. ⚠️ **Pisa los datos de develop.** Lo que hayas creado en develop para probar se borra. Los
   datos de develop son **descartables**.
2. ⚠️ **Migraciones pendientes**: si develop tenía migraciones que prod todavía no tiene, el
   reset revierte el schema al de prod. Los **archivos** de migración siguen en git → volvés a
   aplicarlos con `npm run db:deploy` (o `db:migrate`) contra develop.
3. ⚠️ **PII**: trae teléfonos e incidentes reales. Ok para el piloto; cuando escale, anonimizar.
4. ⚠️ **Clerk**: las filas `User` copiadas traen `clerkUserId` de prod, que no existen en la
   instancia Dev de Clerk. Para mirar datos de incidentes no molesta (los operadores se
   matchean por `phoneNumber`). Para loguearte al dashboard de develop, re-autenticás y la app
   te reconcilia.

---

## 10. Checklist de la PRIMERA promoción develop → main (one-time)

Estas dos cosas se hacen **una sola vez**, en la primera vez que promovemos `develop` a `main`:

1. **Build Command en Vercel** (Settings → General → Build & Development Settings → Build
   Command → Override):
   ```
   npm run db:deploy && npm run build
   ```
   Esto hace que cada deploy aplique migraciones pendientes a la base de su entorno antes de
   buildear. Requiere que `DIRECT_URL` esté seteada en Production y Preview (ya lo está).
   Se activa en la primera promoción porque el script `db:deploy` recién llega a `main` con ese
   merge — si se activa antes, un deploy de prod desde `main` fallaría (no existe el script).
2. **Branch protection en `main`** (GitHub → Settings → Branches):
   - Require a pull request before merging.
   - Required approvals: 0 (trabajo solo).
   - "Include administrators" en OFF por ahora (escape para hotfix). Prender para disciplina total.

---

## 11. Clerk — estado y disparador

- Hoy: **una sola instancia (Development, `pk_test_`)** sirve local + develop + prod.
- Objetivo profesional: instancia **Production (`pk_live_`)** para prod; Development para
  local + develop.
- **Bloqueante**: una instancia Production de Clerk **exige un dominio propio** (registros DNS
  `clerk.tudominio…`). No se puede sobre `*.vercel.app`.
- **Disparador**: el día que prod tenga dominio propio (ej. `app.actus.com.ar`), se crea la
  instancia Production, se cargan `pk_live_/sk_live_` en Vercel **solo Production**, y prod pasa
  a esa instancia.
- **"¿El mismo usuario en los dos entornos?"**: las instancias de Clerk son pools separados. El
  mismo email en Dev y en Prod son **dos usuarios distintos** (`clerkUserId` distinto). Es lo
  correcto y esperado.

---

## 12. Gotchas

- **Neon: migrar por la directa**, no la pooled (PgBouncer rompe `migrate`). Por eso existe
  `DIRECT_URL`.
- **Branch de Neon con expiración**: al crear un branch, Neon puede ponerle un TTL. Sacale la
  fecha de expiración o se autodestruye.
- **turbo.json**: env vars del build tienen que estar declaradas en `tasks.build.env`.
- **prisma.config.ts** usa `dotenv` con `override: true` sobre `.env.local`: no intentes pasar
  `DATABASE_URL=...` por línea de comando, lo pisa el `.env.local`.
- **Vercel env vars**: una entrada por (nombre + entorno); no se pueden solapar entornos.

---

## 13. Estado actual y pendientes (al 2026-09-26)

**Hecho:**
- Neon: branches `production` + `develop` (develop sin expiración).
- Local (`.env.local`) apunta a `develop`.
- Vercel: `DATABASE_URL`/`DIRECT_URL` separadas por entorno; Preview de `develop` deployando OK.
- Prisma: migraciones inicializadas con baseline `0_init` (aplicado en ambas bases).
- git: rama `develop` creada y pusheada; `main` = prod intacta. Branch protection en `main` activa.
- Bot (auditoría) en `develop`: B0 fix RAG + títulos · B1 webhook durable con Inngest ·
  B2 Sentry (DSN-gated) · B3 rate limits + tope de mensajes por evento + validación de media.

**Pendiente:**
- **Primera promoción `develop → main`** — lleva a prod todo lo anterior. En esa promoción:
  1. Activar Build Command de Vercel `npm run db:deploy && npm run build` (§10).
  2. Inngest cloud: crear/sincronizar la app de Actus y cargar `INNGEST_EVENT_KEY` +
     `INNGEST_SIGNING_KEY` en Vercel (Production; Preview si se quiere test en la nube).
  3. Sentry: cargar `NEXT_PUBLIC_SENTRY_DSN` en Vercel (Production) para que capture errores.
  4. Verificar en prod: WhatsApp real → run en el dashboard de Inngest → respuesta al operador.
- Clerk instancia Production (cuando haya dominio, §11).
- Opcional (B4): salida estructurada con tool-use (título/resumen del incidente más robusto que
  el bloque `[[META|...]]`) + página de métricas de negocio sobre Postgres.

---

## 14. Referencia rápida de comandos

```bash
# desarrollo
npm run dev                              # local -> base develop, localhost:3001
npm run db:studio                        # explorar la base (la de DIRECT_URL)

# migraciones
npm run db:migrate -- --name mi_cambio   # crear + aplicar en develop
npm run db:deploy                        # aplicar pendientes (lo corre Vercel en prod)
cd apps/web && npx prisma migrate status # ver estado

# git flow
git checkout develop && git pull
git checkout -b feat/mi-cambio
# ... commit, push, PR -> develop, merge
# cuando estable: PR develop -> main (deploya prod + migra solo)
```
