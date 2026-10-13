import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { LogOut, Mail, UserX } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { buttonStyles } from "@/components/dashboard/ui";
import { ensureDbUser, AuthError } from "@/lib/clerk";
import { hasDashboardAccess } from "@/lib/access";

export const metadata: Metadata = {
  title: "Sin acceso | Actus",
  robots: { index: false, follow: false },
};

/**
 * Terminal page for a signed-in account that has no workspace: an email nobody invited to a
 * company, an operator, or a deactivated user. It never redirects to /sign-in (that is what
 * looped); it explains the situation and offers a way out.
 */
export default async function NoAccessPage() {
  let user;
  try {
    // Re-syncing here means a reload after the invitation was accepted goes straight to the dashboard.
    user = await ensureDbUser();
  } catch (err) {
    if (err instanceof AuthError) redirect("/sign-in");
    throw err;
  }
  if (hasDashboardAccess(user)) redirect("/dashboard");

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const deactivated = !user.isActive;
  const account = email ? <strong className="font-medium text-fg">{email}</strong> : null;

  return (
    <AuthShell>
      <div className="rounded-lg border border-line bg-white px-6 py-8 text-center sm:px-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-[#FAFAFB]">
          <UserX className="h-5 w-5 text-fg-subtle" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <h1 className="mt-5 font-heading text-xl font-extrabold tracking-[-0.01em] text-fg">
          {deactivated ? "Tu cuenta está desactivada" : "Tu cuenta todavía no tiene acceso"}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {deactivated ? (
            <>Un administrador desactivó el acceso de {account ?? "esta cuenta"}. Si creés que es un error, escribinos.</>
          ) : (
            <>
              Iniciaste sesión {account ? <>con {account}</> : "con una cuenta que"}, pero no está asociada a ninguna
              empresa. El panel se habilita por invitación: pedile al administrador de Actus que te invite con este
              mismo email.
            </>
          )}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <SignOutButton redirectUrl="/" className={buttonStyles.primary}>
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Cerrar sesión
          </SignOutButton>
          <a href="mailto:soporte@actusagent.io" className={buttonStyles.secondary}>
            <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Escribir a soporte
          </a>
        </div>

        {!deactivated && (
          <p className="mt-6 text-[13px] text-fg-subtle">
            ¿Ya te invitaron?{" "}
            <Link
              href="/dashboard"
              className="rounded-sm font-medium text-fg underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Volver a intentar
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}
