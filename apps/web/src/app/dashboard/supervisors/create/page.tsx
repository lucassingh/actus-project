import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserPlus, Info } from "lucide-react";

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
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Nuevo supervisor</h1>
          <p className="text-white/80 text-sm mt-1">
            Enviá una invitación por email para que el supervisor cree su cuenta
          </p>
        </div>
      </div>

      {tenants.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <p className="text-amber-800 font-semibold text-sm">No hay empresas creadas</p>
          <p className="text-amber-700 text-sm mt-1">
            Creá una empresa primero desde{" "}
            <a href="/dashboard/tenants/create" className="underline font-medium">
              Empresas → Nueva empresa
            </a>
            .
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <p className="text-red-700 text-sm">{ERROR_MESSAGES[error] ?? "Error desconocido."}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={inviteSupervisor} className="space-y-5">
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Empresa
            </label>
            <select
              id="tenantId"
              name="tenantId"
              required
              disabled={tenants.length === 0}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-40"
              style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
            >
              <option value="">Seleccioná una empresa</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email del supervisor
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="supervisor@empresa.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={tenants.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <UserPlus size={16} />
              Enviar invitación
            </button>
            <a
              href="/dashboard/supervisors"
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
            El supervisor recibe un email para unirse a la organización de esa empresa y elige su
            propia contraseña al aceptar. Una vez que inicia sesión, puede invitar operadores desde
            su propio panel.
          </p>
        </div>
      </div>
    </div>
  );
}
