"use client";

import { useActionState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";

const benefits = [
  {
    title: "Demo real, no un video",
    body: "Le mostramos el bot resolviendo un caso parecido a los de su planta.",
  },
  {
    title: "Diagnóstico de su caso",
    body: "Charlamos sobre sus equipos, sus manuales y dónde se le escapa el conocimiento.",
  },
  {
    title: "Sin compromiso",
    body: "Una conversación, no un contrato. Usted decide si quiere seguir.",
  },
  {
    title: "Piloto a medida",
    body: "Si encaja, armamos un piloto con sus operarios y sus máquinas reales.",
  },
];

const labelCls = "mb-1.5 block text-[13px] font-medium text-ink-300";
const fieldCls =
  "w-full rounded-lg border border-ink-700 bg-ink-950 px-3.5 py-2.5 text-[15px] text-ink-100 placeholder:text-ink-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40";

const initialState: ContactState = { status: "idle" };

export function ContactSection() {
  const reduce = useReducedMotion();
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  return (
    <section id="contacto" className="relative overflow-hidden bg-ink-950 py-28 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(234,88,14,0.1),transparent_65%)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Left — pitch + benefits */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Agendar demo
          </p>
          <h2 className="mt-4 font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[1.05] tracking-tight text-white">
            Veamos Actus funcionando <span className="text-accent">en su planta.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-300">
            Déjenos sus datos y coordinamos una demo. Le mostramos cómo captura el conocimiento de
            su equipo y le damos un diagnóstico concreto para su planta.
          </p>

          <ul className="mt-10 space-y-6">
            {benefits.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <div>
                  <p className="font-heading font-bold text-white">{b.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-400">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right — form card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-ink-700/60 bg-ink-900/60 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] md:p-8"
        >
          {state.status === "success" ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
              <motion.div
                initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/30"
              >
                <Check className="h-8 w-8 text-accent" aria-hidden="true" />
              </motion.div>
              <h3 className="mt-6 font-heading text-2xl font-bold text-white">¡Mensaje enviado!</h3>
              <p className="mt-3 max-w-sm text-ink-300">
                Gracias por escribirnos. Le respondemos en el día para coordinar la demo.
              </p>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              {/* Honeypot (hidden from users) */}
              <input
                type="text"
                name="company_url"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div>
                <label htmlFor="email" className={labelCls}>
                  Email de trabajo <span className="text-accent">*</span>
                </label>
                <input id="email" name="email" type="email" required placeholder="usted@empresa.com" className={fieldCls} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelCls}>
                    Nombre <span className="text-accent">*</span>
                  </label>
                  <input id="firstName" name="firstName" required placeholder="Juan" className={fieldCls} />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelCls}>
                    Apellido
                  </label>
                  <input id="lastName" name="lastName" placeholder="Pérez" className={fieldCls} />
                </div>
              </div>

              <div>
                <label htmlFor="company" className={labelCls}>
                  Empresa <span className="text-accent">*</span>
                </label>
                <input id="company" name="company" required placeholder="Su empresa" className={fieldCls} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="jobTitle" className={labelCls}>
                    Cargo
                  </label>
                  <input id="jobTitle" name="jobTitle" placeholder="Jefe de mantenimiento" className={fieldCls} />
                </div>
                <div>
                  <label htmlFor="companySize" className={labelCls}>
                    Tamaño de la planta
                  </label>
                  <select id="companySize" name="companySize" defaultValue="" className={`${fieldCls} appearance-none`}>
                    <option value="" disabled>
                      Seleccionar…
                    </option>
                    <option>1–10 operarios</option>
                    <option>10–50 operarios</option>
                    <option>50–200 operarios</option>
                    <option>Más de 200 operarios</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={labelCls}>
                  Teléfono / WhatsApp
                </label>
                <input id="phone" name="phone" type="tel" placeholder="+54 9 ..." className={fieldCls} />
              </div>

              <div>
                <label htmlFor="message" className={labelCls}>
                  ¿Algo más que quiera contarnos?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Sus equipos, sus manuales, qué le gustaría resolver…"
                  className={`${fieldCls} resize-none`}
                />
              </div>

              {state.status === "error" && (
                <p role="alert" className="text-sm text-red-400">
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-[transform,background-color,opacity] duration-200 hover:bg-accent-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {pending ? "Enviando…" : "Agendar demo"}
                {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>

              <p className="text-center text-[12px] leading-relaxed text-ink-500">
                Solo usamos sus datos para contactarlo sobre Actus. No compartimos nada con terceros.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
