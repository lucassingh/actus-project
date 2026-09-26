import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ingestFactoryDocPdf, deleteFactoryDoc } from "@/services/factory-doc.service";
import { FileText, Upload, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Page, PageHeader, Card, CardHeader, CardFooter, Badge, EmptyState, Alert, buttonStyles, table, formatDate } from "@/components/dashboard/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────────────────────────────────────

async function uploadDoc(formData: FormData) {
  "use server";

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) redirect("/dashboard/factory-docs?error=no-file");
  if (!file.name.toLowerCase().endsWith(".pdf")) redirect("/dashboard/factory-docs?error=not-pdf");
  if (file.size > 20 * 1024 * 1024) redirect("/dashboard/factory-docs?error=too-large");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await ingestFactoryDocPdf(user.tenantId, file.name, buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes("texto extraíble")
      ? "scanned"
      : "failed";
    redirect(`/dashboard/factory-docs?error=${msg}`);
  }

  redirect("/dashboard/factory-docs?uploaded=1");
}

async function removeDoc(formData: FormData) {
  "use server";

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");

  const docId = parseInt(formData.get("docId") as string, 10);
  if (!isNaN(docId)) await deleteFactoryDoc(docId, user.tenantId);

  redirect("/dashboard/factory-docs");
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  "no-file": "No se seleccionó ningún archivo.",
  "not-pdf": "Solo se aceptan archivos PDF.",
  "too-large": "El archivo supera el límite de 20 MB.",
  "scanned": "El PDF no tiene texto extraíble (está escaneado como imagen). Usá un PDF con texto seleccionable.",
  "failed": "Error al procesar el documento. Intentá de nuevo.",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function FactoryDocsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; uploaded?: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");

  const { error, uploaded } = await searchParams;

  const docs = await prisma.factoryDoc.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      fileSize: true,
      pageCount: true,
      chunkCount: true,
      isProcessed: true,
      createdAt: true,
    },
  });

  return (
    <Page>
      <PageHeader
        title="Documentos de planta"
        description="Manuales, planos y procedimientos que el agente consulta al responder."
      />

      {uploaded && (
        <Alert tone="success" icon={CheckCircle2}>
          Documento procesado. El agente ya puede usarlo.
        </Alert>
      )}
      {error && (
        <Alert tone="danger" icon={AlertCircle}>
          {ERROR_MESSAGES[error] ?? "Error desconocido."}
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader title="Subir documento" description="PDF con texto seleccionable, hasta 20 MB. Los escaneados como imagen no se pueden leer." />
        <form action={uploadDoc}>
          <div className="px-5 py-5">
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#D2D2DA] bg-[#FAFAFB] px-6 py-8 text-center transition-colors duration-150 hover:border-primary/40 hover:bg-[#F6F7FB]"
            >
              <Upload className="h-5 w-5 text-fg-subtle" strokeWidth={1.75} aria-hidden="true" />
              <span className="text-sm font-medium text-fg">Elegí un PDF</span>
              <span className="text-xs text-fg-subtle">Se indexan hasta 80 páginas por documento</span>
              <input
                id="file"
                type="file"
                name="file"
                accept=".pdf,application/pdf"
                required
                className="mt-2 block max-w-full text-[13px] text-fg-muted file:mr-3 file:h-8 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-white file:px-3 file:text-[13px] file:font-medium file:text-fg hover:file:bg-[#FAFAFB]"
              />
            </label>
          </div>
          <CardFooter hint="El procesamiento puede demorar entre 10 y 60 segundos.">
            <button type="submit" className={buttonStyles.primary}>
              Procesar e indexar
            </button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader title="Documentos" description={`${docs.length} cargado${docs.length !== 1 ? "s" : ""}`} />
        {docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Todavía no hay documentos"
            description="Subí los manuales de las máquinas para que el agente responda con la información de su planta."
          />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Nombre</th>
                  <th className={table.th}>Páginas</th>
                  <th className={table.th}>Fragmentos</th>
                  <th className={table.th}>Tamaño</th>
                  <th className={table.th}>Estado</th>
                  <th className={table.th}>Subido</th>
                  <th className={table.th}>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className={table.tr}>
                    <td className={table.td}>
                      <span className="flex items-center gap-2 font-medium text-fg">
                        <FileText className="h-4 w-4 shrink-0 text-fg-subtle" strokeWidth={1.75} aria-hidden="true" />
                        <span className="max-w-xs truncate" title={doc.name}>{doc.name}</span>
                      </span>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{doc.pageCount ?? "-"}</td>
                    <td className={`${table.td} tabular-nums`}>{doc.isProcessed ? doc.chunkCount : "-"}</td>
                    <td className={`${table.td} tabular-nums`}>{doc.fileSize ? formatBytes(doc.fileSize) : "-"}</td>
                    <td className={table.td}>
                      <Badge tone={doc.isProcessed ? "success" : "warning"}>{doc.isProcessed ? "Indexado" : "Procesando"}</Badge>
                    </td>
                    <td className={table.td}>{formatDate(doc.createdAt)}</td>
                    <td className={`${table.td} text-right`}>
                      <form action={removeDoc}>
                        <input type="hidden" name="docId" value={doc.id} />
                        <button
                          type="submit"
                          aria-label={`Eliminar ${doc.name}`}
                          className={`${buttonStyles.icon} hover:bg-[#FDEEEE] hover:text-[#B42626]`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Page>
  );
}
