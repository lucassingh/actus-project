import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export default async function TenantsPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, code: true, industry: true,
      isActive: true, plan: true, createdAt: true,
      _count: { select: { users: true, events: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-white/80 text-sm mt-1">
            {tenants.length} empresa{tenants.length !== 1 ? "s" : ""} registradas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tenants.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Building2 size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No hay empresas registradas</p>
          </div>
        ) : (
          tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{tenant.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">{tenant.code}</span>
                </div>
                {tenant.isActive ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-green-700 bg-green-50">
                    <CheckCircle size={10} />
                    Activa
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100">
                    <XCircle size={10} />
                    Inactiva
                  </span>
                )}
              </div>

              {tenant.industry && (
                <p className="text-sm text-gray-500 mb-3">{tenant.industry}</p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{tenant._count.users}</p>
                  <p className="text-xs text-gray-400">Usuarios</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{tenant._count.events}</p>
                  <p className="text-xs text-gray-400">Eventos</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                  style={{
                    color: "var(--primary)",
                    backgroundColor: "var(--primary)15",
                  }}
                >
                  {tenant.plan}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(tenant.createdAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
