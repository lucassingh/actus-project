import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { normalizeMachineKey } from "@/lib/machines";
import { Page, PageHeader, Card, CardHeader, CardFooter, Alert, Field, buttonStyles, inputStyles } from "@/components/dashboard/ui";

async function createMachine(formData: FormData) {
  "use server";

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const supervisor = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!supervisor || supervisor.role !== "SUPERVISOR" || !supervisor.tenantId) redirect("/dashboard");
  const tenantId = supervisor.tenantId;

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;

  if (!name || !code) redirect("/dashboard/machines/create?error=missing");

  // Reject codes that collide once normalized (COMP-005 vs comp005) — the matcher treats
  // them as the same machine, so two of them would be ambiguous.
  const key = normalizeMachineKey(code);
  if (!key) redirect("/dashboard/machines/create?error=missing");
  const existing = await prisma.machine.findMany({ where: { tenantId }, select: { code: true } });
  if (existing.some((m) => normalizeMachineKey(m.code) === key)) {
    redirect("/dashboard/machines/create?error=duplicate");
  }

  let created;
  try {
    created = await prisma.machine.create({
      data: { tenantId, name, code, sector, location },
      select: { id: true },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      redirect("/dashboard/machines/create?error=duplicate");
    }
    redirect("/dashboard/machines/create?error=failed");
  }

  redirect(`/dashboard/machines/${created.id}?created=1`);
}

const ERROR_MESSAGES: Record<string, string> = {
  missing: "El nombre y el código son requeridos.",
  duplicate: "Ya existe una máquina con ese código en tu planta.",
  failed: "No se pudo crear la máquina. Intentá de nuevo.",
};

export default async function CreateMachinePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR") redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <Page>
      <PageHeader
        back={{ href: "/dashboard/machines", label: "Máquinas" }}
        title="Nueva máquina"
        description="Cargá tus equipos para generar el QR y vincular los incidentes automáticamente."
      />

      {error && (
        <Alert tone="danger" icon={AlertCircle}>
          {ERROR_MESSAGES[error] ?? "Error desconocido."}
        </Alert>
      )}

      <Card>
        <form action={createMachine}>
          <CardHeader title="Datos de la máquina" />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
            <Field id="name" label="Nombre">
              <input id="name" name="name" type="text" required placeholder="Compresor de tornillo 1" className={inputStyles} />
            </Field>
            <Field id="code" label="Código" hint="Corto y único. Va en el QR y es lo que el operario menciona. Ej. COMP-005.">
              <input id="code" name="code" type="text" required placeholder="COMP-005" className={`${inputStyles} font-mono`} />
            </Field>
            <Field id="sector" label="Sector" optional>
              <input id="sector" name="sector" type="text" placeholder="Prensas" className={inputStyles} />
            </Field>
            <Field id="location" label="Ubicación" optional>
              <input id="location" name="location" type="text" placeholder="Nave 2, línea A" className={inputStyles} />
            </Field>
          </div>
          <CardFooter hint="Después de crearla vas a ver el QR para imprimir y pegar en la máquina.">
            <Link href="/dashboard/machines" className={buttonStyles.secondary}>
              Cancelar
            </Link>
            <button type="submit" className={buttonStyles.primary}>
              Crear máquina
            </button>
          </CardFooter>
        </form>
      </Card>
    </Page>
  );
}
