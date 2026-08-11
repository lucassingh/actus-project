import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building2, Info } from "lucide-react";

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
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Nueva empresa</h1>
          <p className="text-white/80 text-sm mt-1">
            Crea una empresa y su organización de Clerk asociada
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <p className="text-red-700 text-sm">{ERROR_MESSAGES[error] ?? "Error desconocido."}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={createTenant} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de la empresa
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="Fábrica Essen"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
              Industria <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="industry"
              type="text"
              name="industry"
              placeholder="Alimenticia"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Building2 size={16} />
              Crear empresa
            </button>
            <a
              href="/dashboard/tenants"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>

      <div className="mt-4 flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 font-medium text-sm">¿Cómo funciona?</p>
          <p className="text-blue-700 text-sm mt-1">
            Crea una Organización de Clerk para esta empresa. Después, invitá un supervisor
            desde <span className="font-mono text-xs">Supervisores → Nuevo supervisor</span> para
            que administre esta empresa.
          </p>
        </div>
      </div>
    </div>
  );
}
