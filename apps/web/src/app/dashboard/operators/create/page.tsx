import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserPlus, Info } from "lucide-react";

async function createOperator(formData: FormData) {
  "use server";

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const supervisor = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!supervisor || supervisor.role !== "SUPERVISOR" || !supervisor.tenantId) redirect("/dashboard");

  const name = (formData.get("name") as string)?.trim();
  const lastname = (formData.get("lastname") as string)?.trim();
  const department = (formData.get("department") as string)?.trim() || null;
  const phoneNumber = (formData.get("phoneNumber") as string)?.replace(/\D/g, "");

  if (!name || !lastname) redirect("/dashboard/operators/create?error=missing-name");
  if (!phoneNumber) redirect("/dashboard/operators/create?error=missing-phone");

  try {
    await prisma.user.create({
      data: {
        tenantId: supervisor.tenantId,
        phoneNumber,
        name,
        lastname,
        department,
        email: "",
        role: "OPERATOR",
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      redirect("/dashboard/operators/create?error=duplicate-phone");
    }
    redirect("/dashboard/operators/create?error=create-failed");
  }

  redirect("/dashboard/operators?created=1");
}

const ERROR_MESSAGES: Record<string, string> = {
  "missing-name": "Nombre y apellido son requeridos.",
  "missing-phone": "El número de WhatsApp es requerido.",
  "duplicate-phone": "Ese número ya está registrado para otro operador.",
  "create-failed": "No se pudo crear el operador. Intentá de nuevo.",
};

export default async function CreateOperatorPage({
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
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Nuevo operador</h1>
          <p className="text-white/80 text-sm mt-1">
            Registrá el número de WhatsApp del operador para que pueda hablar con el asistente
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <p className="text-red-700 text-sm">{ERROR_MESSAGES[error] ?? "Error desconocido."}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={createOperator} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="Juan"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1.5">
                Apellido
              </label>
              <input
                id="lastname"
                type="text"
                name="lastname"
                required
                placeholder="Pérez"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
              Número de WhatsApp
            </label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              required
              placeholder="5493462565888"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--primary)" } as React.CSSProperties}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Código de país + 9 (para celulares argentinos) + característica sin el 0 + número sin el 15. Ej: 3462-565888 → 5493462565888.
            </p>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1.5">
              Área <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="department"
              type="text"
              name="department"
              placeholder="Mantenimiento"
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
              <UserPlus size={16} />
              Crear operador
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
            No hace falta que el operador instale nada: apenas lo registrás acá, ya puede escribirle al asistente desde su WhatsApp normal y empezar a reportar incidentes.
          </p>
        </div>
      </div>
    </div>
  );
}
