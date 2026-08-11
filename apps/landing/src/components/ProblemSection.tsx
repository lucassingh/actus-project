"use client";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { theme } from "@/config/theme";
import { motion } from "framer-motion";
import { BorderBeam } from "@/components/ui/border-beam";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { DotPattern } from "@/components/ui/dot-pattern";
import AnimatedWorkflow from "@/components/animated-assets/AnimatedWorkflow";
import { BrainSVG } from "@/components/animated-assets/BrainSVG";
import { LinkSVG } from "@/components/animated-assets/LinkSVG";
import { PuzzleSVG } from "@/components/animated-assets/PuzzleSVG";
import { GraphicSVG } from "@/components/animated-assets/GraphicSVG";
import { ArrowRight } from "lucide-react";

export function ProblemSection() {
    return (
        <>
            {/* Problem principal aca iria el primer id */}
            <section
                id="desafio"
                className="relative w-full h-auto flex flex-col justify-center py-24 bg-primary overflow-hidden"
                style={{
                    background: `linear-gradient(to bottom, ${theme.colors.primary}, ${theme.colors.primaryDark})`
                }}
            >
                <div className="max-w-4xl mx-auto px-4 mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-heading mb-6 tracking-tight leading-tight">
                            El conocimiento que no se captura, <br />
                            <span className="text-accent">muere con el tiempo.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                            Su planta depende de lo que sus técnicos saben, no de lo que está escrito.
                            Esa es una bomba de tiempo operacional.
                        </p>
                    </motion.div>
                </div>

                <BentoGrid className="max-w-6xl mx-auto px-4 gap-8 mb-32 relative z-10">
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                            className={item.className}
                        >
                            <BentoGridItem
                                title={item.title}
                                description={item.description}
                                header={item.header}
                                className={cn(
                                    "relative overflow-hidden border-white/20 border-[1px] rounded-[10px] min-h-[350px] transition-all duration-500 hover:bg-white/10 h-full",
                                    "!shadow-none"
                                )}
                            >
                                <BorderBeam colorFrom={theme.colors.accent} colorTo="transparent" duration={15} delay={i * 2} />
                            </BentoGridItem>
                        </motion.div>
                    ))}
                </BentoGrid>
            </section>

            {/* Problem Flow Section */}
            <section>
                <div
                    className="relative w-full py-24"
                    style={{ backgroundColor: '#fefeffff' }}
                >
                    <DotPattern
                        className="opacity-40 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
                        width={20}
                        height={20}
                        glow
                    />

                    {/* Título y descripción - OCULTOS EN MOBILE */}
                    <div className="max-w-6xl mx-auto px-4 mb-16 hidden md:block">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-left"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-primary font-heading mb-6 tracking-tight leading-tight">
                                Así es como tu empresa <br />
                                <span className="text-accent">pierde conocimiento y dinero cada día.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-primary/90 max-w-3xl">
                                El ciclo de dependencia del conocimiento tácito genera pérdidas operativas
                                constantes. Cada interrupción cuesta tiempo, recursos y oportunidades.
                            </p>
                        </motion.div>
                    </div>

                    {/* Workflow animado - OCULTO EN MOBILE */}
                    <div className="max-w-[1334px] mx-auto px-4 hidden md:block">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="relative bg-white rounded-2xl p-6 md:p-10 shadow-2xl border border-gray-200/50">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/50 opacity-50" />

                                <div className="relative z-10">
                                    <AnimatedWorkflow />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full" />
                            </div>
                            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-3xl blur-xl opacity-30 -z-10" />
                        </motion.div>
                    </div>

                    {/* CTA Section - Text Only Refactor */}
                    <div className="max-w-4xl mx-auto px-4 mt-8 md:mt-24 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.7,
                                ease: "easeOut",
                                delay: 0.2
                            }}
                            className="relative"
                        >
                            {/* Título */}
                            <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-10 tracking-tight leading-tight">
                                <span className="block text-primaryDark md:inline">¿Cuánto más puede</span>{" "}
                                <span className="block md:inline bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent transform md:scale-110 inline-block font-black">
                                    permitir este ciclo?
                                </span>
                            </h3>

                            {/* Quote simplificada */}
                            <div className="relative max-w-3xl mx-auto py-2 md:py-4 mb-10">
                                <div className="text-xl md:text-3xl font-medium leading-relaxed relative z-10 font-serif italic text-primary/80">
                                    "El conocimiento se va a casa todos los días...
                                    <span className="block mt-2 md:mt-3 text-accent font-bold not-italic font-sans">
                                        y un día no vuelve"
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer px-8 md:px-10 py-4 md:py-5 bg-accent text-white rounded-full font-bold text-lg md:text-xl flex items-center justify-center space-x-3 shadow-xl hover:bg-accentLight transition-all relative overflow-hidden group border border-accent/20"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Agendar Demo
                                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                                    </span>
                                    <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}

const ProblemCardHeader = ({ type, center, large }: { type: "brain" | "link" | "puzzle" | "graphic"; center?: boolean; large?: boolean }) => (
    <div className={cn(
        "relative w-full mb-4 overflow-hidden rounded-xl flex items-center transition-all duration-500",
        large ? "h-72" : "h-60",
        center ? "justify-center" : "justify-start"
    )}>
        <DottedGlowBackground
            className={cn(
                center
                    ? "[mask-image:radial-gradient(circle_at_center,transparent_18%,black_60%)]"
                    : large
                        ? "[mask-image:radial-gradient(circle_at_25%_center,transparent_25%,black_60%)]"
                        : "[mask-image:radial-gradient(circle_at_20%_center,transparent_20%,black_60%)]"
            )}
            color="rgba(255, 255, 255, 0.08)"
            glowColor={theme.colors.accent}
            gap={14}
            radius={0.7}
            opacity={1}
        />
        <div className={cn(
            "relative z-10 w-full h-full flex items-center",
            center ? "justify-center" : "justify-start pl-8"
        )}>
            {type === "brain" && <BrainSVG className="h-[95%] w-auto" />} {/* ← Tamaño fijo en altura */}
            {type === "link" && <LinkSVG className="w-full h-full" />}
            {type === "puzzle" && <PuzzleSVG className="w-full h-full" />}
            {type === "graphic" && <GraphicSVG className="h-[95%] w-auto" />} {/* ← Mismo tamaño que brain */}
        </div>
    </div>
);

const items = [
    {
        title: "Pérdida de Conocimiento Crítico",
        description: "Cuando un técnico experto se va, se lleva años de experiencia no documentada. Esto obliga a repetir errores, alarga capacitaciones y pone en riesgo la continuidad operativa.",
        header: <ProblemCardHeader type="brain" large />,
        className: "md:col-span-2",
    },
    {
        title: "Dependencia de Personas",
        description: "Todo depende del \"técnico estrella\". Si falta, el proceso se detiene, generando cuellos de botella y limitando la escalabilidad del equipo.",
        header: <ProblemCardHeader type="link" center />,
        className: "md:col-span-1",
    },
    {
        title: "Falta de Estandarización",
        description: "Cada técnico actúa a su manera. Resultado: soluciones inconsistentes, más errores y dificultad para replicar lo que funciona.",
        header: <ProblemCardHeader type="puzzle" center />,
        className: "md:col-span-1",
    },
    {
        title: "Visibilidad Limitada para la Gerencia",
        description: "Sin datos reales, es imposible medir eficiencia, prever fallas o tomar decisiones basadas en hechos. La gestión se apoya en informes manuales.",
        header: <ProblemCardHeader type="graphic" large />,
        className: "md:col-span-2",
    },
];
