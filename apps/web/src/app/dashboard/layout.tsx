import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ensureDbUser, AuthError } from "@/lib/clerk";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await ensureDbUser();
  } catch (err) {
    if (err instanceof AuthError) redirect("/sign-in");
    throw err;
  }

  if (!user.isActive) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
