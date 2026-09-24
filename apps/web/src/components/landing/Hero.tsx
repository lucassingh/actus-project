"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import SplitText from "@/components/reactbits/SplitText";

const DotGrid = dynamic(() => import("@/components/reactbits/DotGrid"), { ssr: false });

const HeroAnimatedAsset = dynamic(
  () => import("@/components/animated-assets/HeroAnimatedAsset").then((m) => ({ default: m.HeroAnimatedAsset })),
  { ssr: false, loading: () => <div className="h-[690px] aspect-[462/944]" /> }
);

const headlineFrom = { opacity: 0, y: 28 };
const headlineTo = { opacity: 1, y: 0 };

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-ink-950 pt-32 pb-16 lg:pt-24 lg:pb-0 flex items-center"
    >
      {/* Precision dot field; brightens toward the brand orange under the pointer */}
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black,transparent)]">
        <DotGrid dotSize={3} gap={22} baseColor="#232B4D" activeColor="#EA580E" proximity={140} />
      </div>
      <div
        aria-hidden="true"
        className="absolute -z-10 right-[-10%] top-1/2 -translate-y-1/2 h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(36,47,91,0.55),transparent_65%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="max-w-2xl">
          <h1 className="font-heading font-black text-ink-100 text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.04] tracking-[-0.03em]">
            <SplitText
              tag="span"
              text="El conocimiento de sus técnicos se queda en la planta."
              splitType="words"
              delay={45}
              duration={0.9}
              ease="expo.out"
              from={headlineFrom}
              to={headlineTo}
              textAlign="left"
              rootMargin="0px"
              className="block"
            />
            <SplitText
              tag="span"
              text="Para siempre."
              splitType="words"
              delay={45}
              duration={0.9}
              ease="expo.out"
              from={headlineFrom}
              to={headlineTo}
              textAlign="left"
              rootMargin="0px"
              className="block text-accent mt-1"
            />
          </h1>

          <p className="hero-reveal mt-6 max-w-[34rem] text-lg md:text-xl leading-relaxed text-ink-300 [animation-delay:500ms]">
            Un agente de IA en el WhatsApp de sus técnicos que resuelve fallas y guarda cada solución.
          </p>

          <div className="hero-reveal mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:650ms]">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-ink-950 transition-[transform,background-color] duration-200 ease-[var(--ease-out-expo)] hover:bg-accent-light active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
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

        <div className="flex justify-center lg:justify-end [zoom:0.62] sm:[zoom:0.72] lg:[zoom:0.82] 2xl:[zoom:1]">
          <HeroAnimatedAsset />
        </div>
      </div>
    </section>
  );
}
