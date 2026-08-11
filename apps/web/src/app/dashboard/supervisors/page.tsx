import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Mail, Shield, Building2 } from "lucide-react";

export default async function SupervisorsPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const isActusAdmin =
    (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.actusAdmin === true;
  if (!isActusAdmin) redirect("/dashboard");

  const supervisors = await prisma.user.findMany({
    where: { role: "SUPERVISOR" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, lastname: true, email: true,
      isActive: true, lastLoginAt: true, createdAt: true,
      tenant: { select: { name: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Supervisores</h1>
          <p className="text-white/80 text-sm mt-1">
            {supervisors.length} supervisor{supervisors.length !== 1 ? "es" : ""} registrados
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {supervisors.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No hay supervisores registrados</p>
            <p className="text-gray-400 text-sm mt-1">Invitá uno desde &quot;Nuevo supervisor&quot;</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {supervisors.map((sup) => (
                <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        {(sup.name[0] ?? "?")}{(sup.lastname[0] ?? "")}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {sup.name} {sup.lastname}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-300" />
                      {sup.email}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-gray-300" />
                      {sup.tenant?.name ?? "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sup.isActive
                          ? "text-green-700 bg-green-50"
                          : "text-gray-500 bg-gray-100"
                      }`}
                    >
                      <Shield size={10} />
                      {sup.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {sup.lastLoginAt
                      ? new Date(sup.lastLoginAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
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
