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

  const logo = formData.get("logo") as File | null;
  const hasLogo = !!logo && logo.size > 0;
  if (hasLogo && !logo.type.startsWith("image/")) redirect("/dashboard/tenants/create?error=logo-type");
  if (hasLogo && logo.size > 5 * 1024 * 1024) redirect("/dashboard/tenants/create?error=logo-size");

  let logoFailed = false;
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

    if (hasLogo) {
      // The org already exists at this point: a failed logo upload must not undo the tenant.
      try {
        await client.organizations.updateOrganizationLogo(org.id, { file: logo, uploaderUserId: userId });
      } catch {
        logoFailed = true;
      }
    }
  } catch {
    redirect("/dashboard/tenants/create?error=create-failed");
  }

  redirect(logoFailed ? "/dashboard/tenants?created=1&logo=failed" : "/dashboard/tenants?created=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  "missing-name": "El nombre de la empresa es requerido.",
  "create-failed": "No se pudo crear la empresa. Puede que ya exista una organización con ese nombre.",
  "logo-type": "El logo tiene que ser una imagen (PNG, JPG o SVG).",
  "logo-size": "El logo no puede superar los 5 MB.",
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
            <div className="sm:col-span-2">
              <Field id="logo" label="Logo" optional hint="PNG, JPG o SVG de hasta 5 MB. Se muestra en el panel de la empresa; mejor si es cuadrado.">
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="block w-full text-[13px] text-fg-muted file:mr-3 file:h-8 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-white file:px-3 file:text-[13px] file:font-medium file:text-fg hover:file:bg-[#FAFAFB]"
                />
              </Field>
            </div>
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
