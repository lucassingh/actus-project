"use client";

import { motion } from "framer-motion";
import CardParallaxContainer from "../cards-parallax/CardParallaxContainer";
import { OperatorsSubsection } from "./OperatorsSubsection";
import { HeroSection } from "../ui/HeroSection";



export function SolutionSection() {

    return (
        <>
            <HeroSection
                id="solucion" // usar este id para el scroll 
                smallTitle="Solución Inteligente"
                title={
                    <>
                        Convierta la Experiencia <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500 animate-pulse">
                            en su Mayor Activo
                        </span>
                    </>
                }
                subtitle={
                    <>
                        Deje de perder conocimiento valioso. <span className="font-bold text-accent">Actus IA</span> captura cada solución,
                        aprende de sus mejores técnicos y guía a su equipo para resolver problemas en tiempo récord.
                    </>
                }
            />

            <div className="max-w-6xl mx-auto px-4 mb-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-left"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-primary font-heading mb-0 tracking-tight leading-tight">
                        Nuestro dashboard para supervisores.<br />
                        <span className="text-accent">Convierte la experiencia en su mayor activo.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-primary/90 max-w-3xl">
                        Conoce el desempeño de tus operarios en tiempo real, identifica oportunidades de mejora y toma decisiones informadas.
                    </p>
                </motion.div>
            </div>

            {/* supervisor content */}
            <CardParallaxContainer />

            {/* operator content */}
            <section className="w-full bg-slate-900 mt-12 md:mt-20 flex flex-col items-left py-6 md:py-0">

                {/* Header Content - Moved inside as requested */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-0 md:mb-10 mt-2 md:mt-10 relative z-20">
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[320px] sm:max-w-2xl md:max-w-none mx-auto md:mx-0 text-left"
    >
        <h3 className="px-0 sm:px-0 text-[1.5rem] sm:text-2xl md:text-3xl font-bold text-white font-heading mb-4 sm:mb-4 tracking-tight leading-[1.25]">
            <span className="block">El asistente que sus operadores ya llevan en el bolsillo.</span>
            <span className="block text-accent mt-1">Cree eventos para cada necesidad.</span>
        </h3>
        <p className="px-0 sm:px-0 text-[1.08rem] sm:text-lg md:text-xl text-white/90 max-w-3xl leading-[1.6] pr-0">
            Puede crear incidentes, arreglos o demas tareas, y sobre todo interactuar con{" "}
            <span className="text-orange-500">Actus Bot</span> para resolver problemas en tiempo récord.
        </p>
    </motion.div>
</div>

                <OperatorsSubsection />
            </section>
        </>
    );
}
