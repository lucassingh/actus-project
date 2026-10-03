"use client";

import { motion, useReducedMotion } from "motion/react";
import CardParallaxContainer from "../cards-parallax/CardParallaxContainer";
import { OperatorsSubsection } from "./OperatorsSubsection";

export function SolutionSection() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* Light wrapper (no overflow/transform) so CardParallax's sticky stacking keeps working. */}
      <div className="bg-canvas">
        {/* Intro — clean light hero, flows from the dark Problem above (no floating dark box). */}
        <section id="solucion" className="relative overflow-hidden pt-28 md:pt-36">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-56 w-[70%] max-w-4xl rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={reduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" aria-hidden="true" />
              Solución inteligente
            </motion.p>

            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={reduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 font-heading text-[clamp(2rem,5vw,3.75rem)] font-black leading-[1.05] tracking-tight text-fg"
            >
              Convierta la experiencia
              <br className="hidden sm:block" />{" "}
              <span className="text-accent">en su mayor activo.</span>
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={reduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted md:text-xl"
            >
              Deje de perder conocimiento valioso. <span className="font-semibold text-fg">Actus</span>{" "}
              captura cada solución, aprende de sus mejores técnicos y guía a su equipo para resolver
              problemas en tiempo récord.
            </motion.p>
          </div>

          {/* Dashboard showcase intro */}
          <div className="relative mx-auto mt-24 max-w-6xl px-5 md:mt-32 md:px-8">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                Para el supervisor
              </p>
              <h3 className="mt-3 font-heading text-[clamp(1.6rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-fg">
                Todo lo que pasa en el piso, <span className="text-accent">en un solo panel.</span>
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-fg-muted">
                Conozca el desempeño de sus operarios en tiempo real, detecte oportunidades de mejora y
                tome decisiones con datos, no con informes manuales.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Supervisor dashboard stack (sticky scroll — must not sit inside an overflow-hidden/transformed box) */}
        <CardParallaxContainer />
      </div>

      {/* Operator content (dark) — self-contained how-it-works bento */}
      <OperatorsSubsection />
    </>
  );
}
