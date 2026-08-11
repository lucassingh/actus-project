"use client";

import React from "react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ColourfulText } from "@/components/ui/colourful-text";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const revealVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

export const ProductDefinition = () => {
    return (
        <section className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden py-32 px-6 sm:px-12 md:px-24 bg-background">
            {/* Dot Pattern Background with improved visibility and larger mask */}
            <div className="absolute inset-0 z-0">
                <DotPattern
                    glow
                    className={cn(
                        "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-60"
                    )}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto text-center">
                <div className="text-[30px] md:text-[47px] font-bold leading-[1.3] text-primary font-sans whitespace-pre-wrap tracking-tight space-y-6">
                    {/* Segment 1 */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={revealVariants}
                        className="inline-block"
                    >
                        <ColourfulText text="Actus IA" />
                        <span> es un agente inteligente especializado en mantenimiento industrial diseñado para transformar la experiencia de su equipo en ventaja competitiva.</span>
                    </motion.div>

                    {/* Segment 2 */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={revealVariants}
                        className="block"
                    >
                        <ColourfulText text="Asiste" />
                        <span> a sus técnicos en tiempo real durante intervenciones, </span>
                        <ColourfulText text="aprende" />
                        <span> automáticamente de cada solución aplicada, estructura y </span>
                        <ColourfulText text="conserva" />
                        <span> el conocimiento técnico de su planta, y brinda visibilidad y control total al jefe de mantenimiento.</span>
                    </motion.div>

                    {/* Segment 3 */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={revealVariants}
                        className="block"
                    >
                        <span>No es solo un software, es un </span>
                        <ColourfulText text="compañero digital" />
                        <span> que crece con su fábrica.</span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
