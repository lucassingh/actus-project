"use client";

import { motion, useReducedMotion } from "motion/react";
import { MessagesSquare, Brain, Database, Check } from "lucide-react";
import ScrollReveal from "@/components/reactbits/ScrollReveal";

// Photos: Unsplash (free license), downloaded to /public/landing. To swap any, replace the file
// or point `img` at another. Other verified industrial/technician photos from Unsplash:
//   photo-1615906655593-ad0386982a0f · photo-1595856898575-9d187bd32fd6
//   photo-1621905252507-b35492cc74b4 · photo-1565954786194-d22abeaac3ae
//   photo-1581092334651-ddf26d9a09d0 · photo-1581091224003-01e7c2e69f6f
// (URL form: https://images.unsplash.com/<id>?w=1600&q=80&auto=format&fit=crop)
const features = [
  {
    index: "01",
    label: "Asistencia en tiempo real",
    icon: MessagesSquare,
    title: "Un experto en el bolsillo de todo su equipo",
    body: "El operario describe la falla por WhatsApp —con texto, un audio o una foto— y recibe un diagnóstico con pasos concretos en segundos, apoyados en los manuales y los casos reales de su planta.",
    points: ["Texto, audio o foto", "Responde en segundos", "Usa los manuales de su planta"],
    img: "/landing/feature-asiste.jpg",
    alt: "Técnico de mantenimiento industrial trabajando en planta",
  },
  {
    index: "02",
    label: "Aprendizaje continuo",
    icon: Brain,
    title: "Cada falla resuelta hace a su planta más inteligente",
    body: "Cuando un incidente se cierra, la solución queda registrada y se suma a la base de conocimiento. La próxima vez que aparezca un problema parecido, la respuesta ya está.",
    points: ["Base de conocimiento automática", "Casos reales de su equipo", "Mejora con cada uso"],
    img: "/landing/feature-aprende.jpg",
    alt: "Ingeniero operando maquinaria industrial",
  },
  {
    index: "03",
    label: "Conocimiento que no se va",
    icon: Database,
    title: "El know-how deja de irse con la persona",
    body: "La experiencia de sus mejores técnicos queda en la planta, no solo en sus cabezas. Cuando alguien se jubila o cambia de trabajo, su conocimiento sigue disponible para todo el equipo.",
    points: ["No depende de una sola persona", "Queda documentado y buscable", "Disponible 24/7"],
    img: "/landing/feature-conserva.jpg",
    alt: "Primer plano de una máquina industrial en una fábrica",
  },
];

export function ProductDefinition() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="producto-heading"
      className="relative overflow-hidden bg-canvas py-28 md:py-36"
    >
      <h2 id="producto-heading" className="sr-only">
        Qué es Actus
      </h2>

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal
            containerClassName="text-center"
            textClassName="font-heading font-extrabold text-fg text-[clamp(1.75rem,4vw,3rem)] leading-[1.25] tracking-tight"
            highlightWords={["Actus", "asiste", "aprende", "conserva"]}
            baseOpacity={0.14}
            baseRotation={2}
            blurStrength={4}
          >
            Actus es un agente de IA que vive en el WhatsApp de sus técnicos. Los asiste en cada
            intervención, aprende de cada solución y conserva el conocimiento de su planta.
          </ScrollReveal>
        </div>

        <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
          {features.map((f, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={f.index}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
              >
                {/* Image */}
                <motion.div
                  className={reverse ? "md:order-2" : ""}
                  initial={reduce ? false : { opacity: 0, x: reverse ? 28 : -28 }}
                  whileInView={reduce ? {} : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className={`absolute -bottom-3 h-full w-full rounded-3xl bg-accent/10 ${
                        reverse ? "-right-3" : "-left-3"
                      }`}
                    />
                    <img
                      src={f.img}
                      alt={f.alt}
                      loading="lazy"
                      className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_24px_60px_-28px_rgba(14,17,35,0.45)] ring-1 ring-line"
                    />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-medium text-ink-100 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                      {f.label}
                    </span>
                  </div>
                </motion.div>

                {/* Text */}
                <motion.div
                  className={reverse ? "md:order-1" : ""}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  whileInView={reduce ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-[0_6px_16px_-6px_rgba(234,88,14,0.6)]">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                      {f.index} — {f.label}
                    </span>
                  </div>

                  <h3 className="mt-5 font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] font-extrabold leading-tight tracking-tight text-fg">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-fg-muted">{f.body}</p>

                  <ul className="mt-6 space-y-3">
                    {f.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-[15px] font-medium text-fg">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
                          <Check className="h-3 w-3 text-accent" aria-hidden="true" />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
