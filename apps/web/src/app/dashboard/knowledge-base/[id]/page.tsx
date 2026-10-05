import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, embeddingToSql } from "@/lib/embeddings";
import { CheckCircle2, AlertCircle, Trash2, ArrowUpRight } from "lucide-react";
import {
  Page, PageHeader, Card, CardHeader, CardFooter, Alert, Field,
  buttonStyles, inputStyles, formatDate,
} from "@/components/dashboard/ui";

async function loadEntry(clerkUserId: string, id: number) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) return null;
  const entry = await prisma.knowledgeBase.findFirst({
    where: { id, tenantId: user.tenantId },
    // Explicit select: never pull the image BYTES into the page — only whether one exists
    // (imageMimeType). The bytes are served separately from /api/media/kb/[id].
    select: {
      id: true, problemText: true, solutionText: true, machineName: true, tags: true,
      effectivenessScore: true, timesReferenced: true, timeToResolveMin: true,
      createdAt: true, updatedAt: true, eventId: true, imageMimeType: true,
    },
  });
  return entry ? { entry, tenantId: user.tenantId } : null;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 3 * 1024 * 1024;

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  ).slice(0, 12);
}

async function updateEntry(formData: FormData) {
  "use server";
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) redirect("/dashboard/knowledge-base");
  const loaded = await loadEntry(clerkUserId, id);
  if (!loaded) redirect("/dashboard/knowledge-base");

  const problemText = (formData.get("problemText") as string)?.trim();
  const solutionText = (formData.get("solutionText") as string)?.trim();
  const machineName = (formData.get("machineName") as string)?.trim() || null;
  const tags = parseTags((formData.get("tags") as string) ?? "");
  const scoreRaw = parseInt(formData.get("effectivenessScore") as string, 10);
  const effectivenessScore = Math.max(0, Math.min(10, isNaN(scoreRaw) ? loaded.entry.effectivenessScore : scoreRaw));

  if (!problemText || !solutionText) redirect(`/dashboard/knowledge-base/${id}?error=missing`);

  await prisma.knowledgeBase.update({
    where: { id },
    data: { problemText, solutionText, machineName, tags, effectivenessScore },
  });

  // Reference image (F6): remove, replace, or leave as-is.
  const removeImage = formData.get("removeImage") === "on";
  const image = formData.get("image") as File | null;
  if (removeImage) {
    await prisma.knowledgeBase.update({ where: { id }, data: { imageData: null, imageMimeType: null } });
  } else if (image && image.size > 0) {
    if (!IMAGE_TYPES.includes(image.type)) redirect(`/dashboard/knowledge-base/${id}?error=image-type`);
    if (image.size > IMAGE_MAX_BYTES) redirect(`/dashboard/knowledge-base/${id}?error=image-size`);
    const bytes = Buffer.from(await image.arrayBuffer());
    await prisma.knowledgeBase.update({ where: { id }, data: { imageData: bytes, imageMimeType: image.type } });
  }

  // The embedding is built from problemText, so a changed problem must be re-embedded or RAG
  // keeps matching the old wording. Best-effort: if embedding is unavailable (no OpenAI credit),
  // the text is saved anyway and we flag that the search index wasn't refreshed.
  if (problemText !== loaded.entry.problemText) {
    try {
      const vector = embeddingToSql(await generateEmbedding(problemText));
      await prisma.$executeRaw`
        UPDATE knowledge_base SET "problemEmbedding" = ${vector}::vector WHERE id = ${id}
      `;
    } catch (err) {
      console.error("[KB curation] re-embed failed", err);
      redirect(`/dashboard/knowledge-base/${id}?updated=1&reembed=failed`);
    }
  }

  redirect(`/dashboard/knowledge-base/${id}?updated=1`);
}

async function deleteEntry(formData: FormData) {
  "use server";
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) redirect("/dashboard/knowledge-base");
  const loaded = await loadEntry(clerkUserId, id);
  if (!loaded) redirect("/dashboard/knowledge-base");

  await prisma.knowledgeBase.delete({ where: { id } });
  redirect("/dashboard/knowledge-base?deleted=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  missing: "El problema y la solución no pueden quedar vacíos.",
  "image-type": "La imagen debe ser JPG, PNG o WEBP.",
  "image-size": "La imagen supera el límite de 3 MB.",
};

export default async function KnowledgeBaseEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; reembed?: string; error?: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const { id } = await params;
  const entryId = parseInt(id, 10);
  if (isNaN(entryId)) notFound();

  const loaded = await loadEntry(clerkUserId, entryId);
  if (!loaded) notFound();
  const { entry } = loaded;

  const { updated, reembed, error } = await searchParams;

  return (
    <Page>
      <PageHeader
        back={{ href: "/dashboard/knowledge-base", label: "Base de conocimiento" }}
        title="Editar caso"
        description="Corregí o mejorá el caso. El agente usa este contenido para responder a los operadores."
      />

      {updated && reembed !== "failed" && <Alert tone="success" icon={CheckCircle2}>Caso actualizado.</Alert>}
      {reembed === "failed" && (
        <Alert tone="danger" icon={AlertCircle}>
          Se guardaron los cambios, pero no se pudo actualizar el índice de búsqueda (¿crédito de OpenAI?).
          Volvé a guardar cuando esté disponible para que el agente lo encuentre con el texto nuevo.
        </Alert>
      )}
      {error && <Alert tone="danger" icon={AlertCircle}>{ERROR_MESSAGES[error] ?? "Error desconocido."}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <form action={updateEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <CardHeader title="Contenido del caso" />
            <div className="flex flex-col gap-5 px-5 py-5">
              <Field id="problemText" label="Problema" hint="Si lo cambiás, se recalcula el índice de búsqueda del agente.">
                <textarea id="problemText" name="problemText" required rows={3} defaultValue={entry.problemText} className={`${inputStyles} h-auto py-2`} />
              </Field>
              <Field id="solutionText" label="Solución">
                <textarea id="solutionText" name="solutionText" required rows={5} defaultValue={entry.solutionText} className={`${inputStyles} h-auto py-2`} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="machineName" label="Máquina" optional>
                  <input id="machineName" name="machineName" type="text" defaultValue={entry.machineName ?? ""} className={inputStyles} />
                </Field>
                <Field id="effectivenessScore" label="Efectividad (0–10)" hint="Tu criterio: qué tan útil es este caso.">
                  <input id="effectivenessScore" name="effectivenessScore" type="number" min={0} max={10} defaultValue={entry.effectivenessScore} className={`${inputStyles} tabular-nums`} />
                </Field>
              </div>
              <Field id="tags" label="Tags" optional hint="Separados por coma.">
                <input id="tags" name="tags" type="text" defaultValue={entry.tags.join(", ")} className={inputStyles} />
              </Field>

              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-fg">Imagen de referencia</span>
                {entry.imageMimeType && (
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/media/kb/${entry.id}?v=${entry.updatedAt.getTime()}`}
                      alt="Imagen de referencia del caso"
                      className="h-28 w-28 rounded-lg border border-line object-cover"
                    />
                    <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                      <input type="checkbox" name="removeImage" className="h-4 w-4 rounded border-line text-primary focus:ring-primary" />
                      Quitar la imagen
                    </label>
                  </div>
                )}
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-1 block max-w-full text-[13px] text-fg-muted file:mr-3 file:h-8 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-white file:px-3 file:text-[13px] file:font-medium file:text-fg hover:file:bg-[#FAFAFB]"
                />
                <p className="text-xs leading-relaxed text-fg-subtle">
                  JPG, PNG o WEBP, hasta 3 MB. El bot se la envía al operario cuando usa este caso para responder.
                </p>
              </div>
            </div>
            <CardFooter hint="Los cambios impactan en las próximas respuestas del agente.">
              <Link href="/dashboard/knowledge-base" className={buttonStyles.secondary}>Cancelar</Link>
              <button type="submit" className={buttonStyles.primary}>Guardar</button>
            </CardFooter>
          </form>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Datos" />
            <dl className="divide-y divide-line-subtle">
              {[
                ["Veces consultado", `${entry.timesReferenced}`],
                ["Creado", formatDate(entry.createdAt)],
                ["Tiempo de resolución", entry.timeToResolveMin != null ? `${entry.timeToResolveMin} min` : "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-5 py-2.5">
                  <dt className="text-[13px] text-fg-subtle">{label}</dt>
                  <dd className="text-[13px] font-medium text-fg">{value}</dd>
                </div>
              ))}
              <div className="px-5 py-2.5">
                <Link href={`/dashboard/events/${entry.eventId}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
                  Ver incidente de origen <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </dl>
          </Card>

          <Card className="border-[#F3C7C7]">
            <CardHeader title="Eliminar caso" description="El agente deja de usarlo. El incidente de origen se conserva." />
            <div className="px-5 py-4">
              <details className="group">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[13px] font-medium text-[#B42626]">
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  Eliminar este caso
                </summary>
                <form action={deleteEntry} className="mt-3 flex items-center gap-3">
                  <input type="hidden" name="id" value={entry.id} />
                  <p className="text-[13px] text-fg-muted">¿Seguro? No se puede deshacer.</p>
                  <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-[#B42626] px-4 text-sm font-medium text-white transition-colors hover:bg-[#9B1F1F]">
                    Sí, eliminar
                  </button>
                </form>
              </details>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
