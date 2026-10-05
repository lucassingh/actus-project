import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { machineWaLink, machinePrefill } from "@/lib/machines";
import { CheckCircle2, AlertCircle, QrCode, Download, Inbox, Trash2 } from "lucide-react";
import {
  Page, PageHeader, Card, CardHeader, CardFooter, Alert, Badge, EmptyState, Field,
  buttonStyles, inputStyles, formatDate,
} from "@/components/dashboard/ui";
import { EVENT_STATUS, EVENT_PRIORITY } from "@/components/dashboard/event-meta";

async function loadMachine(clerkUserId: string, machineId: number) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) return null;
  const machine = await prisma.machine.findFirst({ where: { id: machineId, tenantId: user.tenantId } });
  return machine ? { machine, tenantId: user.tenantId } : null;
}

async function updateMachine(formData: FormData) {
  "use server";
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) redirect("/dashboard/machines");
  const loaded = await loadMachine(clerkUserId, id);
  if (!loaded) redirect("/dashboard/machines");

  const name = (formData.get("name") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const isActive = formData.get("isActive") === "on";

  if (!name) redirect(`/dashboard/machines/${id}?error=missing`);

  await prisma.machine.update({ where: { id }, data: { name, sector, location, isActive } });
  redirect(`/dashboard/machines/${id}?updated=1`);
}

async function deleteMachine(formData: FormData) {
  "use server";
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) redirect("/dashboard/machines");
  const loaded = await loadMachine(clerkUserId, id);
  if (!loaded) redirect("/dashboard/machines");

  // Events keep their history; the FK is ON DELETE SET NULL, so they just lose the link.
  await prisma.machine.delete({ where: { id } });
  redirect("/dashboard/machines?deleted=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  missing: "El nombre es requerido.",
};

export default async function MachineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const { id } = await params;
  const machineId = parseInt(id, 10);
  if (isNaN(machineId)) notFound();

  const loaded = await loadMachine(clerkUserId, machineId);
  if (!loaded) notFound();
  const { machine } = loaded;

  const { created, updated, error } = await searchParams;

  const [events, eventCount] = await Promise.all([
    prisma.event.findMany({
      where: { machineId: machine.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, status: true, priority: true, createdAt: true },
    }),
    prisma.event.count({ where: { machineId: machine.id } }),
  ]);

  const waLink = machineWaLink(machine.code);
  const qrSvg = waLink
    ? await QRCode.toString(waLink, { type: "svg", margin: 1, width: 200, errorCorrectionLevel: "M" })
    : null;
  const qrDataUrl = qrSvg ? `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}` : null;

  return (
    <Page>
      <PageHeader
        back={{ href: "/dashboard/machines", label: "Máquinas" }}
        meta={
          <>
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-white">{machine.code}</span>
            <Badge tone={machine.isActive ? "success" : "neutral"}>{machine.isActive ? "Activa" : "Inactiva"}</Badge>
          </>
        }
        title={machine.name}
        description={[machine.sector, machine.location].filter(Boolean).join(" · ") || undefined}
      />

      {created && <Alert tone="success" icon={CheckCircle2}>Máquina creada. Imprimí el QR y pegalo en el equipo.</Alert>}
      {updated && <Alert tone="success" icon={CheckCircle2}>Cambios guardados.</Alert>}
      {error && <Alert tone="danger" icon={AlertCircle}>{ERROR_MESSAGES[error] ?? "Error desconocido."}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* QR / sticker */}
        <Card>
          <CardHeader title="QR de la máquina" description="Escanealo para reportar por WhatsApp." />
          <div className="flex flex-col items-center gap-4 px-5 py-6">
            {qrSvg && qrDataUrl ? (
              <>
                <div
                  className="rounded-lg border border-line bg-white p-3 [&>svg]:h-44 [&>svg]:w-44"
                  // QR is generated server-side from a trusted URL we build ourselves.
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className="text-center">
                  <p className="font-mono text-sm font-semibold text-fg">{machine.code}</p>
                  <p className="mt-0.5 text-xs text-fg-subtle">{machine.name}</p>
                </div>
                <a href={qrDataUrl} download={`qr-${machine.code}.svg`} className={buttonStyles.secondary}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Descargar QR
                </a>
                <p className="w-full rounded-md border border-line bg-[#FAFAFB] px-3 py-2 text-center text-xs text-fg-subtle">
                  Abre WhatsApp con: <span className="font-medium text-fg-muted">“{machinePrefill(machine.code)}”</span>
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <QrCode className="h-8 w-8 text-fg-subtle" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm font-medium text-fg">QR no disponible</p>
                <p className="max-w-[40ch] text-xs text-fg-subtle">
                  Configurá la variable <span className="font-mono">WHATSAPP_BOT_NUMBER</span> (el número visible del
                  bot, ej. 15556608866) para generar el QR.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Edit */}
          <Card>
            <form action={updateMachine}>
              <input type="hidden" name="id" value={machine.id} />
              <CardHeader title="Editar" description="El código no se puede cambiar: el QR ya impreso seguiría apuntando al anterior." />
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                <Field id="name" label="Nombre">
                  <input id="name" name="name" type="text" required defaultValue={machine.name} className={inputStyles} />
                </Field>
                <Field id="code-ro" label="Código">
                  <input id="code-ro" type="text" disabled value={machine.code} className={`${inputStyles} font-mono opacity-60`} />
                </Field>
                <Field id="sector" label="Sector" optional>
                  <input id="sector" name="sector" type="text" defaultValue={machine.sector ?? ""} className={inputStyles} />
                </Field>
                <Field id="location" label="Ubicación" optional>
                  <input id="location" name="location" type="text" defaultValue={machine.location ?? ""} className={inputStyles} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-fg-muted">
                  <input type="checkbox" name="isActive" defaultChecked={machine.isActive} className="h-4 w-4 rounded border-line text-primary focus:ring-primary" />
                  Máquina activa
                </label>
              </div>
              <CardFooter hint="Los cambios no afectan los eventos ya vinculados.">
                <button type="submit" className={buttonStyles.primary}>Guardar</button>
              </CardFooter>
            </form>
          </Card>

          {/* Danger zone */}
          <Card className="border-[#F3C7C7]">
            <CardHeader title="Eliminar máquina" description="Los eventos se conservan, pero quedan sin máquina vinculada." />
            <div className="px-5 py-4">
              <details className="group">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[13px] font-medium text-[#B42626]">
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  Eliminar {machine.code}
                </summary>
                <form action={deleteMachine} className="mt-3 flex items-center gap-3">
                  <input type="hidden" name="id" value={machine.id} />
                  <p className="text-[13px] text-fg-muted">¿Seguro? Esta acción no se puede deshacer.</p>
                  <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-[#B42626] px-4 text-sm font-medium text-white transition-colors hover:bg-[#9B1F1F]">
                    Sí, eliminar
                  </button>
                </form>
              </details>
            </div>
          </Card>
        </div>
      </div>

      {/* Events for this machine */}
      <Card className="mt-6">
        <CardHeader
          title="Incidentes de esta máquina"
          description={`${eventCount} en total`}
          actions={
            eventCount > 0 ? (
              <Link href="/dashboard/events" className="text-[13px] font-medium text-fg-muted hover:text-fg">Ver eventos</Link>
            ) : undefined
          }
        />
        {events.length === 0 ? (
          <EmptyState icon={Inbox} title="Sin incidentes todavía" description="Cuando se reporte algo de esta máquina, va a aparecer acá." />
        ) : (
          <ul>
            {events.map((e) => {
              const status = EVENT_STATUS[e.status] ?? EVENT_STATUS.OPEN;
              const priority = EVENT_PRIORITY[e.priority] ?? EVENT_PRIORITY.MEDIUM;
              return (
                <li key={e.id} className="border-b border-line-subtle last:border-0">
                  <Link href={`/dashboard/events/${e.id}`} className="flex items-center gap-4 px-5 py-3 transition-colors duration-150 hover:bg-[#FAFAFB]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{e.title}</p>
                      <p className="mt-0.5 text-xs text-fg-subtle">{formatDate(e.createdAt, true)}</p>
                    </div>
                    <Badge tone={priority.tone}>{priority.label}</Badge>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Page>
  );
}
