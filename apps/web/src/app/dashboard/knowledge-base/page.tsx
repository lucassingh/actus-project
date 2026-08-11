import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookOpen, Star, Clock, Settings } from "lucide-react";

export default async function KnowledgeBasePage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, tenantId: true },
  });
  if (!user || !user.tenantId) redirect("/sign-in");

  const entries = await prisma.knowledgeBase.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ timesReferenced: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, problemText: true, solutionText: true,
      effectivenessScore: true, timesReferenced: true,
      machineName: true, tags: true, timeToResolveMin: true, createdAt: true,
    },
    take: 50,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <h1 className="text-2xl font-bold">Base de Conocimiento</h1>
          <p className="text-white/80 text-sm mt-1">
            {entries.length} incident{entries.length !== 1 ? "es" : "e"} documentado{entries.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">La base de conocimiento está vacía</p>
          <p className="text-gray-400 text-sm mt-1">
            Se llena automáticamente cuando los operadores resuelven incidentes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{entry.problemText}</h3>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {/* Effectiveness score */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.round(entry.effectivenessScore / 2) ? "text-yellow-400" : "text-gray-200"}
                        fill={i < Math.round(entry.effectivenessScore / 2) ? "#facc15" : "transparent"}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{entry.effectivenessScore}/10</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Consultado {entry.timesReferenced} veces
                  </span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                <p className="text-xs text-green-700 font-medium mb-1">Solución</p>
                <p className="text-sm text-green-800 line-clamp-3">{entry.solutionText}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                {entry.machineName && (
                  <span className="flex items-center gap-1">
                    <Settings size={11} />
                    {entry.machineName}
                  </span>
                )}
                {entry.timeToResolveMin && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {entry.timeToResolveMin} min
                  </span>
                )}
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--primary)15", color: "var(--primary)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
