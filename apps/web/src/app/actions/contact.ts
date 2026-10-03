"use server";

import { Resend } from "resend";
import { z } from "zod";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const schema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  firstName: z.string().trim().min(1, "Ingresá su nombre."),
  lastName: z.string().trim().optional(),
  company: z.string().trim().min(1, "Ingresá el nombre de su empresa."),
  jobTitle: z.string().trim().optional(),
  companySize: z.string().trim().optional(),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: a hidden field real users never see. If it's filled, it's a bot — drop it quietly.
  if ((formData.get("company_url") as string)?.length) {
    return { status: "success" };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    jobTitle: formData.get("jobTitle"),
    companySize: formData.get("companySize"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY no configurada — no se envió el lead");
    return { status: "error", message: "No pudimos enviar el mensaje ahora. Probá más tarde." };
  }

  const d = parsed.data;
  // onboarding@resend.dev works without verifying a domain, but only delivers to the Resend
  // account's own email — set CONTACT_TO_EMAIL to that address. Once a domain is verified,
  // switch CONTACT_FROM_EMAIL to something like "Actus <hola@actus.ai>".
  const to = process.env.CONTACT_TO_EMAIL ?? "hola@actus.ai";
  const from = process.env.CONTACT_FROM_EMAIL ?? "Actus <onboarding@resend.dev>";

  const text = [
    `Nombre: ${`${d.firstName} ${d.lastName ?? ""}`.trim()}`,
    `Email: ${d.email}`,
    `Empresa: ${d.company}`,
    d.jobTitle ? `Cargo: ${d.jobTitle}` : null,
    d.companySize ? `Tamaño de planta: ${d.companySize}` : null,
    d.phone ? `Teléfono: ${d.phone}` : null,
    "",
    d.message ? `Mensaje:\n${d.message}` : "(sin mensaje)",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: d.email,
      subject: `Nuevo contacto — ${d.company}`,
      text,
    });

    if (error) {
      console.error("[contact] resend error", error);
      return { status: "error", message: "No pudimos enviar el mensaje. Probá de nuevo en un momento." };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[contact] send failed", err);
    return { status: "error", message: "No pudimos enviar el mensaje. Probá de nuevo en un momento." };
  }
}
