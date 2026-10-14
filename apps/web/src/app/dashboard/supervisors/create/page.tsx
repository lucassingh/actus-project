import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
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
  } catch (error) {
    // Clerk explains why in errors[0].code — keep it instead of collapsing every failure into one message.
    const code = clerkErrorCode(error);
    console.error("[inviteSupervisor] Clerk rejected the invitation", { code, tenantId, error });
    Sentry.captureException(error, { tags: { flow: "invite-supervisor", clerkCode: code ?? "unknown" } });
    redirect(`/dashboard/supervisors/create?error=invite-failed${code ? `&code=${encodeURIComponent(code)}` : ""}`);
  }

  redirect("/dashboard/supervisors?invited=1");
}

function clerkErrorCode(error: unknown): string | undefined {
  const errors = (error as { errors?: { code?: unknown }[] } | null)?.errors;
  const code = Array.isArray(errors) ? errors[0]?.code : undefined;
  return typeof code === "string" ? code : undefined;
}

const ERROR_MESSAGES: Record<string, string> = {
  "missing-fields": "El email y la empresa son requeridos.",
  "invite-failed": "No se pudo enviar la invitación.",
};

const CLERK_ERROR_MESSAGES: Record<string, string> = {
  duplicate_record: "Ya hay una invitación pendiente para ese email en esta empresa.",
  already_a_member_in_organization: "Ese email ya es miembro de esta empresa.",
  organization_membership_quota_exceeded:
    "La empresa llegó al máximo de miembros que permite Clerk (las invitaciones pendientes también cuentan).",
  form_param_format_invalid: "El email no tiene un formato válido.",
};

export default async function CreateSupervisorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string }>;
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

  const { error, code } = await searchParams;
  const errorMessage = error
    ? (code && CLERK_ERROR_MESSAGES[code]) ??
      `${ERROR_MESSAGES[error] ?? "Error desconocido."}${code ? ` (código de Clerk: ${code})` : ""}`
    : null;

  return (
    <Page>
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

      {errorMessage && (
        <Alert tone="danger" icon={AlertCircle}>
          {errorMessage}
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
          <CardFooter>
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
