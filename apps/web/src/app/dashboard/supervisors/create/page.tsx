import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { Page, PageHeader, Card, CardHeader, CardFooter, Alert, Field, buttonStyles, inputStyles } from "@/components/dashboard/ui";

async function inviteSupervisor(formData: FormData) {
  "use server";

  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  if (!isActusAdmin) redirect("/dashboard");

  const email = (formData.get("email") as string)?.trim();
  const tenantId = Number(formData.get("tenantId"));
  if (!email || !tenantId) redirect("/dashboard/supervisors/create?error=missing-fields");

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { clerkOrgId: true } });
  if (!tenant) redirect("/dashboard/supervisors/create?error=invite-failed");

  try {
    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: tenant.clerkOrgId,
      emailAddress: email,
      role: "org:admin",
      inviterUserId: userId,
    });
  } catch {
    redirect("/dashboard/supervisors/create?error=invite-failed");
  }

  redirect("/dashboard/supervisors?invited=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  "missing-fields": "El email y la empresa son requeridos.",
  "invite-failed": "No se pudo enviar la invitación. El email puede ya estar registrado o invitado.",
};

export default async function CreateSupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  if (!isActusAdmin) redirect("/dashboard");

  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const { error } = await searchParams;

  return (
    <Page className="max-w-3xl">
      <PageHeader
        title="Invitar supervisor"
        description="El supervisor recibe un email, elige su contraseña y después registra a sus operadores."
      />

      {tenants.length === 0 && (
        <Alert tone="info" icon={Info} title="Primero creá una empresa">
          Cada supervisor administra una empresa.{" "}
          <Link href="/dashboard/tenants/create" className="font-medium text-fg underline underline-offset-2">
            Crear empresa
          </Link>
        </Alert>
      )}

      {error && (
        <Alert tone="danger" icon={AlertCircle}>
          {ERROR_MESSAGES[error] ?? "Error desconocido."}
        </Alert>
      )}

      <Card>
        <form action={inviteSupervisor}>
          <CardHeader title="Invitación" />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
            <Field id="tenantId" label="Empresa">
              <select id="tenantId" name="tenantId" required disabled={tenants.length === 0} defaultValue="" className={inputStyles}>
                <option value="" disabled>
                  Seleccioná una empresa
                </option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="email" label="Email">
              <input id="email" name="email" type="email" required placeholder="supervisor@empresa.com" className={inputStyles} />
            </Field>
          </div>
          <CardFooter hint="La invitación le llega por email desde Clerk, el proveedor de acceso.">
            <Link href="/dashboard/supervisors" className={buttonStyles.secondary}>
              Cancelar
            </Link>
            <button type="submit" disabled={tenants.length === 0} className={buttonStyles.primary}>
              Enviar invitación
            </button>
          </CardFooter>
        </form>
      </Card>
    </Page>
  );
}
