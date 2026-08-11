"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HeroAnimatedAsset } from "@/components/animated-assets/HeroAnimatedAsset";
import { EncryptedText } from "@/components/ui/encrypted-text";

export function Hero() {
  return (

    <section id="home" className="min-h-screen w-full relative overflow-hidden flex items-center bg-white pt-24 md:pt-0">
      {/* Background decoration */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Column: Text Content */}
        <div className="flex flex-col items-start justify-center text-left order-1 md:order-1">
          <div className="mb-6 w-full relative">
            <TextGenerateEffect
              words="El conocimiento de sus técnicos se queda en la planta."
              className="text-4xl md:text-4xl lg:text-5xl font-extrabold font-heading text-primary leading-[1.08] inline"
            />
            {" "}
            <div className="inline-block">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.5 }}
                className="block mt-1 text-4xl md:text-4xl lg:text-5xl font-extrabold font-heading text-accent leading-[1.08] drop-shadow-[0_4px_12px_rgba(249,115,22,0.35)]"
              >
                <EncryptedText
                  text="Para siempre."
                  startDelay={3.0}
                  className="text-accent"
                />
              </motion.span>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
            className="font-normal text-base text-neutral-600 font-sans text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
          >
            <span className="text-accent font-bold">Actus IA</span>: La plataforma que convierte la experiencia de su equipo en un activo digital permanente. Documenta, aprende y escala el conocimiento técnico de su fábrica.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-full font-bold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-accent/20 hover:bg-accent-light transition-colors relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">Agendar Demo <ArrowRight className="w-5 h-5" /></span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
            </motion.button>


          </motion.div>
        </div>

        {/* Right Column: Animated Asset */}
        <div className="flex justify-center md:justify-end items-center order-2 md:order-2 h-full py-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <HeroAnimatedAsset />
            {/* Decorative blob behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}