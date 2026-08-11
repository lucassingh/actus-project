import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserPlus, Info } from "lucide-react";

async function inviteOperator(formData: FormData) {
  "use server";

  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/dashboard/operators/create?error=no-org");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });
  if (!user || user.role !== "SUPERVISOR") redirect("/dashboard");

  const email = (formData.get("email") as string)?.trim();
  if (!email) redirect("/dashboard/operators/create?error=missing-email");

  try {
    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: "org:member",
      inviterUserId: userId,
    });
  } catch {
    redirect("/dashboard/operators/create?error=invite-failed");
  }

  redirect("/dashboard/operators?invited=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  "no-org": "Tu cuenta no tiene una Organización de Clerk configurada. Creá una en el panel de Clerk para poder invitar operadores.",
  "missing-email": "El email es requerido.",
  "invite-failed": "No se pudo enviar la invitación. El email puede ya estar registrado o invitado.",
};

export default async function CreateOperatorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR") redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Nuevo operador</h1>
          <p className="text-white/80 text-sm mt-1">
            Enviá una invitación por email para que el operador cree su cuenta
          </p>
        </div>
      </div>

      {!orgId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <p className="text-amber-800 font-semibold text-sm">Sin organización de Clerk</p>
          <p className="text-amber-700 text-sm mt-1">
            Para invitar operadores necesitás tener una Organización activa en Clerk. Creá una en{" "}
            <span className="font-mono text-xs">dashboard.clerk.com</span> y luego volvé a iniciar sesión.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <p className="text-red-700 text-sm">{ERROR_MESSAGES[error] ?? "Error desconocido."}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={inviteOperator} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email del operador
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="operador@empresa.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!orgId}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <UserPlus size={16} />
              Enviar invitación
            </button>
            <a
              href="/dashboard/operators"
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
            El operador recibe un email con un link para unirse a tu organización. Una vez que inicia sesión en la app mobile, su perfil queda registrado automáticamente en tu empresa.
          </p>
        </div>
      </div>
    </div>
  );
}
