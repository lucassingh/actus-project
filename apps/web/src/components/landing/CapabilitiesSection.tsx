"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  QrCode,
  BarChart3,
  BookOpenText,
  ShieldCheck,
  Image as ImageIcon,
  CalendarClock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import ScrollReveal from "@/components/reactbits/ScrollReveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  span: string; // bento column span (6-col grid)
  featured?: boolean;
};

// Bento rows (6 cols): [QR 3 + KPIs 3] · [Manuales 2 + Escala 2 + Imágenes 2] · [Resumen 3 + Aprende 3]
const features: Feature[] = [
  {
    icon: QrCode,
    title: "Reportar es escanear un QR",
    body: "El operario escanea el sticker de la máquina y WhatsApp se abre con la máquina ya identificada. Cero fricción, cero apps que instalar.",
    span: "md:col-span-3",
    featured: true,
  },
  {
    icon: BarChart3,
    title: "El tablero que la gerencia pedía",
    body: "Tasa de resolución, tiempos y las máquinas que más fallan, en vivo. Decisiones con datos reales, no con informes manuales.",
    span: "md:col-span-3",
    featured: true,
  },
  {
    icon: BookOpenText,
    title: "Responde con tus manuales",
    body: "Lee los PDF de tu planta —completos, sin romper tablas— y cita la página de donde salió la respuesta.",
    span: "md:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Sabe cuándo escalar",
    body: "Prioriza por criticidad y avisa al supervisor cuando hay riesgo o el operario pide un humano.",
    span: "md:col-span-2",
  },
  {
    icon: ImageIcon,
    title: "Responde con imágenes",
    body: "Manda la foto de referencia correcta del caso, no solo texto.",
    span: "md:col-span-2",
  },
  {
    icon: CalendarClock,
    title: "Tu semana, resumida",
    body: "Cada lunes el supervisor recibe por email cómo estuvo la planta: incidentes, resueltos, tiempos y lo que se escaló.",
    span: "md:col-span-3",
  },
  {
    icon: Sparkles,
    title: "Aprende con cada incidente",
    body: "Cada caso resuelto alimenta la base de conocimiento; el supervisor la cura y el agente responde cada vez mejor.",
    span: "md:col-span-3",
  },
];

export function CapabilitiesSection() {
  const reduce = useReducedMotion();

  return (
    <section id="capacidades" className="relative overflow-hidden bg-ink-950 py-28 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-[560px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,47,91,0.35),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Capacidades
          </p>
          <h2 className="mt-4 font-heading text-[clamp(1.9rem,4.2vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-ink-100">
            Más que un chatbot: un asistente que{" "}
            <span className="text-accent">entiende tu planta.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-300">
            Del reporte por WhatsApp al tablero del supervisor, cada pieza trabaja para que el
            conocimiento de tu planta esté siempre disponible.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-6 md:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className={f.span}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={reduce ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard className="flex h-full flex-col p-6 md:p-7">
                  {f.featured && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-16 left-8 h-32 w-32 rounded-full bg-accent/15 blur-3xl"
                    />
                  )}
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border border-ink-700 bg-ink-800/70 ${
                      f.featured ? "text-accent" : "text-ink-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3
                    className={`mt-5 font-heading font-bold text-ink-100 ${
                      f.featured ? "text-xl md:text-2xl" : "text-lg"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-300">{f.body}</p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        <ScrollReveal
          containerClassName="mt-20 md:mt-24"
          textClassName="mx-auto max-w-3xl text-center font-heading text-[clamp(1.4rem,3vw,2.1rem)] font-extrabold leading-tight tracking-tight text-ink-100"
          highlightWords={["conocimiento", "no", "se", "pierde"]}
          enableBlur={false}
          baseOpacity={0.14}
          baseRotation={0}
        >
          Con Actus, el conocimiento de tu planta no se pierde: queda, crece y está siempre a mano.
        </ScrollReveal>
      </div>
    </section>
  );
}
