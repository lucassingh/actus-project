"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import {
  KnowledgeLossVisual,
  DependencyVisual,
  StandardizationVisual,
  VisibilityVisual,
} from "./problem-visuals";

const problems = [
  {
    pill: "Sin captura",
    title: "Pérdida de conocimiento crítico",
    body: "Cuando un técnico experto se va, se lleva años de experiencia no documentada. Se repiten errores, se alargan las capacitaciones y la continuidad operativa queda en riesgo.",
    Visual: KnowledgeLossVisual,
    span: "md:col-span-3",
  },
  {
    pill: "Punto único de falla",
    title: "Dependencia de personas",
    body: "Todo depende del “técnico estrella”. Si falta, el proceso se detiene: cuellos de botella y un equipo que no escala.",
    Visual: DependencyVisual,
    span: "md:col-span-3",
  },
  {
    pill: "Sin método común",
    title: "Falta de estandarización",
    body: "Cada técnico actúa a su manera: soluciones inconsistentes y lo que funciona no se puede replicar.",
    Visual: StandardizationVisual,
    span: "md:col-span-2",
  },
  {
    pill: "Sin datos",
    title: "Visibilidad limitada para la gerencia",
    body: "Sin datos reales es imposible medir eficiencia, prever fallas o decidir con hechos. La gestión se apoya en informes manuales.",
    Visual: VisibilityVisual,
    span: "md:col-span-4",
  },
];

export function ProblemSection() {
  const reduce = useReducedMotion();

  return (
    <section id="desafio" className="relative overflow-hidden bg-ink-950 py-28 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,47,91,0.35),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            El desafío
          </p>
          <h2 className="mt-4 font-heading text-[clamp(1.9rem,4.2vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-ink-100">
            El conocimiento que no se captura,{" "}
            <span className="text-accent">muere con el tiempo.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-300">
            Su planta depende de lo que sus técnicos saben, no de lo que está escrito. Esa es una
            bomba de tiempo operativa.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-6 md:gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              className={p.span}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <SpotlightCard className="flex h-full flex-col p-6 md:p-7">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800/60 px-3 py-1 text-xs font-medium text-ink-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {p.pill}
                </span>

                <div className="my-2 flex-1">
                  <p.Visual />
                </div>

                <h3 className="font-heading text-lg font-bold text-ink-100 md:text-xl">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-300">{p.body}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Pivot: the turn from problem to solution */}
        <div className="relative mx-auto mt-24 max-w-3xl md:mt-32">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 select-none font-serif text-[7rem] leading-none text-accent/15"
          >
            &ldquo;
          </span>
          <blockquote className="relative text-center font-serif text-2xl italic leading-relaxed text-ink-100 md:text-3xl">
            El conocimiento se va a casa todos los días…
            <span className="mt-2 block font-sans font-bold not-italic text-accent">
              y un día no vuelve.
            </span>
          </blockquote>

          <div className="relative mt-12 overflow-hidden rounded-3xl p-px">
            {reduce ? (
              <div aria-hidden="true" className="absolute inset-0 rounded-3xl ring-1 ring-accent/25" />
            ) : (
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent,rgba(234,88,14,0.6),transparent_25%)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
            )}
            <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-ink-900 to-ink-950 px-8 py-12 text-center md:px-12 md:py-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
              />
              <h3 className="relative font-heading text-[clamp(1.6rem,3.5vw,2.5rem)] font-black leading-tight tracking-tight text-ink-100">
                ¿Cuánto más puede permitir <span className="text-accent">este ciclo?</span>
              </h3>
              <p className="relative mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-300">
                La buena noticia: tiene solución, y empieza hoy.
              </p>
              <div className="relative mt-8 flex justify-center">
                <a
                  href="#solucion"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white transition-[transform,background-color] duration-200 ease-[var(--ease-out-expo)] hover:bg-accent-light active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Ver cómo lo resolvemos
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
