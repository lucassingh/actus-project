import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Page, PageHeader, Card, CardHeader, CardFooter, Alert, Field, buttonStyles, inputStyles } from "@/components/dashboard/ui";

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
    <Page>
      <PageHeader
        title="Nuevo operador"
        description="No tiene que instalar nada: apenas lo registrás, ya puede escribirle al asistente desde su WhatsApp."
      />

      {error && (
        <Alert tone="danger" icon={AlertCircle}>
          {ERROR_MESSAGES[error] ?? "Error desconocido."}
        </Alert>
      )}

      <Card>
        <form action={createOperator}>
          <CardHeader title="Datos del operador" />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
            <Field id="name" label="Nombre">
              <input id="name" name="name" type="text" required placeholder="Juan" className={inputStyles} />
            </Field>
            <Field id="lastname" label="Apellido">
              <input id="lastname" name="lastname" type="text" required placeholder="Pérez" className={inputStyles} />
            </Field>
            <Field
              id="phoneNumber"
              label="Número de WhatsApp"
              hint="Con código de país, sin el 0 ni el 15. Celular argentino: 54 9 + característica + número (ej. 5493462565888)."
            >
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                required
                placeholder="5493462565888"
                className={`${inputStyles} font-mono tabular-nums`}
              />
            </Field>
            <Field id="department" label="Área" optional>
              <input id="department" name="department" type="text" placeholder="Mantenimiento" className={inputStyles} />
            </Field>
          </div>
          <CardFooter hint="El número tiene que coincidir con el que usa en WhatsApp.">
            <Link href="/dashboard/operators" className={buttonStyles.secondary}>
              Cancelar
            </Link>
            <button type="submit" className={buttonStyles.primary}>
              Crear operador
            </button>
          </CardFooter>
        </form>
      </Card>
    </Page>
  );
}
