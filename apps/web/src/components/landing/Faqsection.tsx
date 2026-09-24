"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Wrench,
    DollarSign,
    Users,
    ShieldCheck,
    RefreshCw,
    BarChart3,
    Target,
    Rocket,
    HelpCircle,
    Plus,
    Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Boxes } from "../ui/Boxes";

interface FaqItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

const FaqItem = ({ question, answer, isOpen, onClick, index }: FaqItemProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn(
                "group mb-4 rounded-2xl border transition-all duration-500 overflow-hidden",
                isOpen
                    ? "bg-white border-accent shadow-2xl shadow-accent/20"
                    : "bg-white border-primary/20 hover:border-accent/60 shadow-sm hover:shadow-md"
            )}
        >
            <button
                onClick={onClick}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
            >
                <span className={cn(
                    "text-lg font-bold transition-colors duration-300",
                    isOpen ? "text-accent" : "text-primary group-hover:text-accent"
                )}>
                    {question}
                </span>
                <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                    isOpen
                        ? "bg-accent border-accent text-white rotate-180"
                        : "bg-primary/5 border-primary/30 text-primary/50 group-hover:border-accent/50 group-hover:text-accent group-hover:scale-110"
                )}>
                    <ChevronDown size={22} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-6 pb-8 text-primary/80 leading-relaxed border-t border-primary/5 pt-6 bg-primary/[0.02]">
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="text-lg"
                            >
                                {answer}
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const Faqsection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqData = [
        {
            category: "Técnicas y Funcionalidad",
            icon: Wrench,
            items: [
                {
                    question: "¿Qué necesito para implementar Actus IA en mi planta?",
                    answer: "Que sus técnicos tengan un teléfono — no hace falta instalar nada nuevo, ya cuentan con lo necesario. Nosotros nos encargamos de la configuración, carga inicial de documentación y capacitación de su equipo."
                },
                {
                    question: "¿Funciona sin internet o en zonas con conectividad limitada?",
                    answer: "Sí. El asistente funciona como cualquier chat: si se corta la señal un instante, el mensaje queda encolado y se envía solo apenas vuelve la conexión, sin que el técnico tenga que hacer nada distinto."
                },
                {
                    question: "¿Qué tipo de documentación técnica puede procesar el sistema?",
                    answer: "Manuales PDF, planos, hojas técnicas, procedimientos escritos, imágenes de máquinas, historiales de mantenimiento previos, y cualquier documentación estructurada o no estructurada de su planta."
                }
            ]
        },
        {
            category: "Costos y ROI",
            icon: DollarSign,
            items: [
                {
                    question: "¿Cuál es el tiempo promedio para ver retorno de la inversión (ROI)?",
                    answer: "La mayoría de nuestros clientes ven ROI en el primer mes, principalmente por reducción en tiempos de parada. En 3 meses ya tienen métricas claras de mejora (40-60% menos tiempo por evento)."
                },
                {
                    question: "¿Hay costos ocultos o de configuración adicional?",
                    answer: "No. El precio incluye implementación, configuración inicial, capacitación y soporte técnico. Solo pagaría extra si solicita integraciones personalizadas con sistemas legacy específicos."
                },
                {
                    question: "¿Qué pasa si quiero agregar más técnicos después?",
                    answer: "Puede escalar en cualquier momento. Se factura mensualmente por usuario activo, puede agregar o reducir según sus necesidades sin penalidades."
                }
            ]
        },
        {
            category: "Uso y Adopción",
            icon: Users,
            items: [
                {
                    question: "¿Cuánto tiempo toma capacitar a mis técnicos para usar la plataforma?",
                    answer: "Menos de 1 hora. La interfaz es intuitiva, similar a usar WhatsApp con fotos/voz. Los técnicos mayores suelen adaptarse en su primer evento real con el sistema."
                },
                {
                    question: "¿Los técnicos veteranos se resisten a usar tecnología nueva?",
                    answer: "Al contrario, valoran que su conocimiento se preserve. Les alivia la presión de ser los únicos que \"saben\". La captura por voz/foto es natural para ellos, no requiere escribir largos informes."
                },
                {
                    question: "¿Puedo controlar qué información se comparte entre diferentes líneas o turnos?",
                    answer: "Sí, tiene control granular. Puede configurar acceso por área, máquina, tipo de problema o rol. La información sensible queda bajo permisos específicos."
                }
            ]
        },
        {
            category: "Seguridad y Datos",
            icon: ShieldCheck,
            items: [
                {
                    question: "¿Dónde se almacenan los datos de mi planta? ¿Son míos?",
                    answer: "Los datos son 100% propiedad de su empresa. Puede elegir almacenamiento cloud (AWS/GCP con cifrado) o on-premise. Ofrecemos exportación completa en cualquier momento sin costos adicionales."
                }
            ]
        },
        {
            category: "Integraciones y Compatibilidad",
            icon: RefreshCw,
            items: [
                {
                    question: "¿Se integra con mi CMMS/ERP actual?",
                    answer: "Sí, tenemos conectores para SAP, IBM Maximo, Fiix, UpKeep y otros sistemas comunes. Si su sistema es personalizado, evaluamos la integración caso por caso."
                },
                {
                    question: "¿Funciona en cualquier tipo de industria o maquinaria?",
                    answer: "Sí, es agnóstico a industria. Ya funciona en automotriz, alimenticia, minería, energía y farmacéutica. Se adapta a sus máquinas específicas aprendiendo de sus manuales y casos."
                }
            ]
        },
        {
            category: "Resultados y Métricas",
            icon: BarChart3,
            items: [
                {
                    question: "¿Qué métricas concretas puedo esperar mejorar?",
                    answer: "Tiempo medio de resolución (-40-60%), tasa de problemas recurrentes (-70%), tiempo de capacitación de nuevos técnicos (-50%), y disponibilidad de máquinas (+15-25%)."
                },
                {
                    question: "¿Cómo miden y demuestran el ROI mensualmente?",
                    answer: "Le entregamos un dashboard ejecutivo con: horas ahorradas, eventos resueltos, conocimiento capturado, y comparativa mes a mes. Incluye cálculo automático de ahorro en salarios y producción."
                }
            ]
        },
        {
            category: "Implementación y Soporte",
            icon: Target,
            items: [
                {
                    question: "¿Cuánto tiempo toma la implementación completa?",
                    answer: "Entre 2 días y 2 semanas, dependiendo del tamaño de su planta y documentación disponible. La fase 1 (funcionalidad básica) está operativa en 48 horas."
                },
                {
                    question: "¿Qué tipo de soporte ofrecen y en qué horarios?",
                    answer: "Soporte técnico 24/7 para incidencias críticas, y soporte administrativo de 8 AM a 6 PM. Incluimos un Customer Success Manager dedicado durante los primeros 3 meses."
                }
            ]
        },
        {
            category: "Futuro y Escalabilidad",
            icon: Rocket,
            items: [
                {
                    question: "¿El sistema sigue aprendiendo indefinidamente?",
                    answer: "Sí, cada evento resuelto enriquece la base. También puede marcar soluciones como \"obsoletas\" cuando actualiza máquinas, manteniendo solo lo relevante."
                },
                {
                    question: "¿Ofrecen módulos avanzados para mantenimiento predictivo?",
                    answer: "Sí, como módulo adicional. Analiza patrones históricos para predecir fallas (ej: \"Máquina XYZ probablemente falle en 48-72 horas\")."
                }
            ]
        }
    ];

    // Flatten items to have a unique index for accordion
    const flattenedItems = faqData.flatMap(cat => cat.items);

    return (
        <section className="relative py-32 px-4 overflow-hidden bg-white" id="faq">
            {/* Gray Dot Grid Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Subtle dots pattern in gray */}
                <div className="absolute inset-0 w-full h-full opacity-40 z-0"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #E5E7EB 1.5px, transparent 0)', backgroundSize: '32px 32px' }} />

                {/* Subtle gradient highlights */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] opacity-50" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8 backdrop-blur-sm"
                    >
                        <HelpCircle size={18} className="text-accent" />
                        <span className="text-sm font-bold text-accent uppercase tracking-[0.2em]">Knowledge Hub</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary mb-8 leading-tight tracking-tight"
                    >
                        Despeje sus <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">Dudas</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-xl md:text-2xl text-primary/60 max-w-3xl mx-auto font-medium"
                    >
                        Todo lo que necesita saber para transformar el mantenimiento
                        de su planta con inteligencia artificial.
                    </motion.p>
                </div>

                {/* Content split by categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                    {faqData.map((category, catIndex) => (
                        <div key={catIndex} className="relative">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="flex items-center gap-4 mb-8"
                            >
                                <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                                    <category.icon size={28} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-primary tracking-tight leading-none mb-1">{category.category}</h3>
                                    <div className="h-1 w-20 bg-accent rounded-full" />
                                </div>
                            </motion.div>

                            <div className="grid gap-4">
                                {category.items.map((item, itemIndex) => {
                                    const globalIndex = faqData.slice(0, catIndex).reduce((acc, c) => acc + c.items.length, 0) + itemIndex;

                                    return (
                                        <FaqItem
                                            key={itemIndex}
                                            question={item.question}
                                            answer={item.answer}
                                            isOpen={openIndex === globalIndex}
                                            onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                                            index={itemIndex}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Support CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-32 p-4 md:p-12 rounded-[2.5rem] bg-primary border border-primary/5 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white flex items-center justify-center mb-6 md:mb-8 shadow-xl shadow-black/10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Rocket size={40} className="text-accent animate-pulse" />
                        </div>
                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 tracking-tight">¿Listo para dar el siguiente paso?</h3>
                        <p className="text-base md:text-xl text-white/70 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                            No deje que sus preguntas frenen la evolución de su planta.
                            Agende una consultoría técnica gratuita hoy mismo.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <a href="/sign-in" className="w-full sm:w-auto px-6 md:px-10 py-3 md:py-5 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 text-base md:text-lg text-center">
                                Iniciar sesión
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
