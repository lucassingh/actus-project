"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const HeroAnimatedAsset = dynamic(
  () => import("@/components/animated-assets/HeroAnimatedAsset").then((m) => ({ default: m.HeroAnimatedAsset })),
  { ssr: false, loading: () => <div className="w-75 h-125" /> }
);

export function Hero() {
  return (
    <section id="home" className="min-h-screen w-full relative overflow-hidden flex items-center bg-white pt-24 md:pt-0">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-125 h-125 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Column */}
        <div className="flex flex-col items-start justify-center text-left order-1 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 w-full"
          >
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold font-heading text-primary leading-[1.08] inline">
              El conocimiento de sus técnicos se queda en la planta.
            </h1>
            {" "}
            <span className="block mt-1 text-4xl md:text-4xl lg:text-5xl font-extrabold font-heading text-accent leading-[1.08] drop-shadow-[0_4px_12px_rgba(249,115,22,0.35)]">
              Para siempre.
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="font-normal text-neutral-600 font-sans text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
          >
            <span className="text-accent font-bold">Actus IA</span>: La plataforma que convierte la experiencia de su equipo en un activo digital permanente. Documenta, aprende y escala el conocimiento técnico de su fábrica.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full"
          >
            <a
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:bg-accent-light transition-colors"
            >
              Iniciar sesión <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex justify-center md:justify-end items-center order-2 md:order-2 h-full py-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <HeroAnimatedAsset />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-87.5 h-162.5 bg-linear-to-tr from-primary/10 to-accent/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
