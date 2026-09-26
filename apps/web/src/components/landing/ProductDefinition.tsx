"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const revealVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

export const ProductDefinition = () => {
    return (
        <section className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden py-32 px-6 sm:px-12 md:px-24 bg-background">
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
                        <span className="text-accent">Actus IA</span>
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
                        <span className="text-accent">Asiste</span>
                        <span> a sus técnicos en tiempo real durante intervenciones, </span>
                        <span className="text-accent">aprende</span>
                        <span> automáticamente de cada solución aplicada, estructura y </span>
                        <span className="text-accent">conserva</span>
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
                        <span className="text-accent">compañero digital</span>
                        <span> que crece con su fábrica.</span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
