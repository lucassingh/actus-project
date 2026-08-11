import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserCircle, Mail, Shield } from "lucide-react";

export default async function OperatorsPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || user.role !== "SUPERVISOR" || !user.tenantId) redirect("/dashboard");

  const operators = await prisma.user.findMany({
    where: { tenantId: user.tenantId, role: "OPERATOR" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, lastname: true, email: true,
      isActive: true, department: true, lastLoginAt: true, createdAt: true,
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Operadores</h1>
          <p className="text-white/80 text-sm mt-1">
            {operators.length} operador{operators.length !== 1 ? "es" : ""} registrados
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {operators.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No hay operadores registrados</p>
            <p className="text-gray-400 text-sm mt-1">Invitá operadores desde el panel de Clerk</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Área</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {operators.map((op) => (
                <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        {op.name[0]}{op.lastname[0]}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {op.name} {op.lastname}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-300" />
                      {op.email}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {op.department ?? "-"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        op.isActive
                          ? "text-green-700 bg-green-50"
                          : "text-gray-500 bg-gray-100"
                      }`}
                    >
                      <Shield size={10} />
                      {op.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {op.lastLoginAt
                      ? new Date(op.lastLoginAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                      : "Nunca"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
