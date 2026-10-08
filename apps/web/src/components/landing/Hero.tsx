"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useSiteReady } from "./SiteLoader";

const DotGrid = dynamic(() => import("@/components/reactbits/DotGrid"), { ssr: false });

const HeroAnimatedAsset = dynamic(
  () =>
    import("@/components/animated-assets/HeroAnimatedAsset").then((m) => ({
      default: m.HeroAnimatedAsset,
    })),
  { ssr: false, loading: () => <div className="h-[690px] aspect-[462/944]" /> }
);

// Left-side feature slider. The phone on the right stays fixed; only this copy rotates.
const slides = [
  {
    eyebrow: "Captura de conocimiento",
    title: "El conocimiento de sus técnicos se queda en la planta. Para siempre.",
    accent: ["para", "siempre"],
    subtitle: "Cada solución que encuentran queda registrada y lista para la próxima vez.",
  },
  {
    eyebrow: "Asistencia en tiempo real",
    title: "Sus técnicos resuelven fallas desde WhatsApp, en segundos.",
    accent: ["whatsapp"],
    subtitle: "Un agente de IA que entiende texto, audio y fotos del problema.",
  },
  {
    eyebrow: "Aprendizaje continuo",
    title: "Cada incidente resuelto hace a su planta más inteligente.",
    accent: ["más", "inteligente"],
    subtitle: "La base de conocimiento crece sola, con los casos reales de su equipo.",
  },
  {
    eyebrow: "Visibilidad total",
    title: "Su jefe de mantenimiento ve todo lo que pasa en el piso.",
    accent: ["todo", "lo", "que", "pasa"],
    subtitle: "Incidentes, tiempos y know-how, en un panel claro.",
  },
];

const SLIDE_MS = 5200;

const norm = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
// Reduced motion swaps the timing, not the structure: the first render has to match the
// server's, where useReducedMotion is still null (dropping the variants was a hydration error).
const containerInstant: Variants = { hidden: {}, show: {} };
const itemInstant: Variants = {
  hidden: item.hidden,
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0 } },
};

export function Hero() {
  const reduce = useReducedMotion();
  // Entrance waits for the loader to clear (it would otherwise play hidden underneath it).
  const ready = useSiteReady();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // The phone mounts on reveal: fetch its chunk now so it's there by then.
  useEffect(() => {
    void import("@/components/animated-assets/HeroAnimatedAsset");
  }, []);

  useEffect(() => {
    if (reduce || paused || !ready) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduce, ready]);

  const slide = slides[active];
  const accentSet = new Set(slide.accent);
  const containerV = reduce ? containerInstant : container;
  const itemV = reduce ? itemInstant : item;

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100dvh] w-full items-center overflow-hidden bg-ink-950 pt-32 pb-16 lg:pt-24 lg:pb-0"
    >
      {/* Precision dot field; brightens toward the brand orange under the pointer */}
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black,transparent)]">
        <DotGrid dotSize={3} gap={22} baseColor="#232B4D" activeColor="#EA580E" proximity={140} />
      </div>
      <div
        aria-hidden="true"
        className="absolute -z-10 right-[-10%] top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,47,91,0.55),transparent_65%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-[1.1fr_auto_0.9fr] lg:gap-8">
        {/* LEFT — rotating feature copy */}
        <div
          className="max-w-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="min-h-[300px] sm:min-h-[320px] lg:min-h-[340px]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                variants={containerV}
                initial="hidden"
                animate={ready ? "show" : "hidden"}
                exit={reduce ? undefined : { opacity: 0, filter: "blur(8px)", transition: { duration: 0.28 } }}
              >
                <motion.p
                  variants={itemV}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {slide.eyebrow}
                </motion.p>

                <h1 className="font-heading text-[clamp(2.25rem,4.8vw,4rem)] font-black leading-[1.05] tracking-[-0.03em] text-ink-100">
                  {slide.title.split(/(\s+)/).map((w, i) =>
                    /^\s+$/.test(w) ? (
                      w
                    ) : (
                      <motion.span
                        key={i}
                        variants={itemV}
                        className={`inline-block${accentSet.has(norm(w)) ? " text-accent" : ""}`}
                      >
                        {w}
                      </motion.span>
                    )
                  )}
                </h1>

                <motion.p
                  variants={itemV}
                  className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-300 md:text-xl"
                >
                  {slide.subtitle}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile progress dots */}
          <div className="mt-6 flex gap-2 lg:hidden">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Ver ${s.eyebrow}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-7 bg-accent" : "w-2.5 bg-ink-700 hover:bg-ink-600"
                }`}
              />
            ))}
          </div>

          {/* Fixed CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white transition-[transform,background-color] duration-200 ease-[var(--ease-out-expo)] hover:bg-accent-light active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Agendar demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#solucion"
              className="rounded text-base font-medium text-ink-300 underline-offset-4 transition-colors duration-150 hover:text-ink-100 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* MIDDLE — vertical progress rail (desktop) */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3" role="tablist" aria-label="Características">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={i === active}
              aria-label={`Ver ${s.eyebrow}`}
              className="group relative h-14 w-0.5 overflow-hidden rounded-full bg-ink-700"
            >
              {i === active && (
                <motion.span
                  key={active}
                  className="absolute inset-x-0 top-0 block w-full origin-top bg-accent"
                  style={{ height: "100%" }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: ready ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                />
              )}
              <span className="absolute inset-0 -mx-2 group-hover:bg-ink-600/0" />
            </button>
          ))}
        </div>

        {/* RIGHT — fixed phone. Mounted on reveal so its chat starts from the first message;
            the placeholder keeps the same box meanwhile, so nothing shifts. */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-end [zoom:0.62] sm:[zoom:0.72] lg:[zoom:0.82] 2xl:[zoom:1]"
        >
          {ready ? <HeroAnimatedAsset /> : <div className="h-[690px] aspect-[462/944]" />}
        </motion.div>
      </div>
    </section>
  );
}
