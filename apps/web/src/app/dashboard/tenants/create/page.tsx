import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Page, PageHeader, Card, CardHeader, CardFooter, Alert, Field, buttonStyles, inputStyles } from "@/components/dashboard/ui";

async function createTenant(formData: FormData) {
  "use server";

  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  if (!isActusAdmin) redirect("/dashboard");

  const name = (formData.get("name") as string)?.trim();
  const industry = (formData.get("industry") as string)?.trim() || null;
  if (!name) redirect("/dashboard/tenants/create?error=missing-name");

  try {
    const client = await clerkClient();
    const org = await client.organizations.createOrganization({ name, createdBy: userId });

    await prisma.tenant.create({
      data: {
        clerkOrgId: org.id,
        name: org.name,
        code: (org.slug ?? org.id).toUpperCase().slice(0, 20),
        industry,
      },
    });
  } catch {
    redirect("/dashboard/tenants/create?error=create-failed");
  }

  redirect("/dashboard/tenants?created=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  "missing-name": "El nombre de la empresa es requerido.",
  "create-failed": "No se pudo crear la empresa. Puede que ya exista una organización con ese nombre.",
};

export default async function CreateTenantPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  if (!isActusAdmin) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <Page>
      <PageHeader
        title="Nueva empresa"
        description="Cada empresa tiene su propio espacio: supervisores, operadores, documentos y conocimiento."
      />

      {error && (
        <Alert tone="danger" icon={AlertCircle}>
          {ERROR_MESSAGES[error] ?? "Error desconocido."}
        </Alert>
      )}

      <Card>
        <form action={createTenant}>
          <CardHeader title="Datos de la empresa" />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
            <Field id="name" label="Nombre">
              <input id="name" name="name" type="text" required placeholder="Fábrica Essen" className={inputStyles} />
            </Field>
            <Field id="industry" label="Industria" optional>
              <input id="industry" name="industry" type="text" placeholder="Alimenticia" className={inputStyles} />
            </Field>
          </div>
          <CardFooter hint="Después de crearla, invitá a su supervisor desde Supervisores.">
            <Link href="/dashboard/tenants" className={buttonStyles.secondary}>
              Cancelar
            </Link>
            <button type="submit" className={buttonStyles.primary}>
              Crear empresa
            </button>
          </CardFooter>
        </form>
      </Card>
    </Page>
  );
}
