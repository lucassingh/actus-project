import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ingestFactoryDocPdf, deleteFactoryDoc } from "@/services/factory-doc.service";
import { FileText, Upload, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documentos de planta</h1>
              <p className="text-white/80 text-sm mt-1">
                {docs.length} documento{docs.length !== 1 ? "s" : ""} · el agente los usa como contexto al responder
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback banners */}
      {uploaded && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <p className="text-green-800 text-sm font-medium">
            Documento cargado y procesado correctamente. El agente ya puede usarlo.
          </p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{ERROR_MESSAGES[error] ?? "Error desconocido."}</p>
        </div>
      )}

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-1">Subir documento (PDF)</p>
        <p className="text-xs text-gray-400 mb-4">
          Máximo 20 MB · Solo PDFs con texto seleccionable (no escaneados) · Límite de 80 páginas por índice
        </p>
        <form action={uploadDoc} className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            name="file"
            accept=".pdf,application/pdf"
            required
            className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:text-white file:cursor-pointer cursor-pointer"
            style={{ "--file-bg": "var(--primary)" } as React.CSSProperties}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Upload size={15} />
            Procesar e indexar
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          El procesamiento puede demorar 10–60 segundos según el tamaño del PDF.
        </p>
      </div>

      {/* Doc list */}
      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No hay documentos cargados</p>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            Subí manuales de máquinas, planos y procedimientos para que el agente los use como referencia.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Páginas</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Fragmentos indexados</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Tamaño</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                      <FileText size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-xs" title={doc.name}>{doc.name}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {doc.pageCount ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {doc.isProcessed ? (
                      <span className="font-medium text-gray-800">{doc.chunkCount}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {doc.fileSize ? formatBytes(doc.fileSize) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {doc.isProcessed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-green-700 bg-green-50">
                        <CheckCircle size={11} />
                        Indexado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-700 bg-yellow-50">
                        <Clock size={11} />
                        Procesando
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <form action={removeDoc}>
                      <input type="hidden" name="docId" value={doc.id} />
                      <button
                        type="submit"
                        title="Eliminar documento"
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
