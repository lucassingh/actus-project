"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, DollarSign, Zap, Users, Settings, Shield, Building, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boxes } from "../ui/Boxes";

export function PricingSection() {
    const [model, setModel] = useState<"kickoff" | "saas">("kickoff");

    const pricingData = {
        kickoff: {
            name: "Modelo Kick-off",
            icon: Settings,
            badge: "Más Popular",
            initialCost: "u$d 1,500",
            description: "Implementación completa + Usuarios mensuales",
            features: [
                {
                    title: "Configuración personalizada",
                    description: "Adaptamos la plataforma a su planta específica"
                },
                {
                    title: "Carga inicial de conocimiento",
                    description: "Manuales, historial y documentación existente"
                },
                {
                    title: "Capacitación in-situ",
                    description: "Entrenamiento presencial para su equipo"
                }
            ],
            monthlyUsers: [
                {
                    role: "Usuario Supervisor",
                    description: "Dashboard completo + análisis",
                    price: "u$d 150",
                    period: "por mes"
                },
                {
                    role: "Usuario Técnico",
                    description: "Actus Bot en su teléfono",
                    price: "u$d 100",
                    period: "por mes"
                }
            ]
        },
        saas: {
            name: "Modelo SaaS",
            icon: Zap,
            badge: null,
            initialCost: "u$d 200",
            description: "Todo incluido en suscripción mensual",
            features: [
                {
                    title: "Sin costo inicial",
                    description: "Comience inmediatamente sin inversión inicial"
                },
                {
                    title: "Acceso completo",
                    description: "Todas las funcionalidades incluidas"
                },
                {
                    title: "Soporte estándar",
                    description: "Asistencia técnica por email y chat"
                }
            ],
            monthlyUsers: [
                {
                    role: "Usuario Supervisor",
                    description: "Dashboard completo + análisis",
                    price: "u$d 150",
                    period: "por mes"
                },
                {
                    role: "Usuario Técnico",
                    description: "Actus Bot en su teléfono",
                    price: "u$d 100",
                    period: "por mes"
                }
            ]
        }
    };

    const currentPlan = pricingData[model];

    return (
        <section className="relative py-20 px-4 overflow-hidden" id="pricing">
            {/* Background Boxes con gradiente iria el id de pricing */}
            <div className="absolute inset-0 w-full h-full">
                {/* Gradiente que se activa desde la mitad */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-primary/30 via-primary/50 to-primary/90" />

                {/* Máscara para el efecto difuminado desde la mitad */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-primary/30 z-0" />

                {/* Boxes animados con color accent */}
                <div className="absolute inset-0 w-full h-full z-0 opacity-20">
                    <Boxes
                        boxColor="#F97316" // color accent
                        background="transparent"
                    />
                </div>

                {/* Overlay adicional para suavizar */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white via-white/80 to-primary/5 z-0" />
            </div>

            {/* Contenido principal */}
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 backdrop-blur-sm"
                    >
                        <DollarSign size={16} className="text-accent" />
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Inversión Inteligente</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 leading-tight"
                    >
                        Invierta en conocimiento,
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">
                            no en reemplazarlo.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-primary/80 max-w-3xl mx-auto"
                    >
                        Elija el modelo que mejor se adapte a su proceso de transformación digital.
                        Cada solución incluye acceso completo a todas las funcionalidades.
                    </motion.p>
                </div>

                {/* Toggle Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col items-center mb-12"
                >
                    <div className="flex flex-col md:flex-row bg-white/80 backdrop-blur-sm p-2 rounded-2xl w-full max-w-sm md:max-w-xl mb-8 relative shadow-lg gap-2 md:gap-0">
                        <div
                            className={cn(
                                "hidden md:block absolute top-2 bottom-2 w-[48%] bg-gradient-to-r from-accent to-orange-500 rounded-xl transition-all duration-200",
                                model === "kickoff" ? "left-2" : "left-[52%]"
                            )}
                        />
                        <button
                            onClick={() => setModel("kickoff")}
                            className={cn(
                                "w-full md:flex-1 h-12 md:h-auto py-0 md:py-4 px-3 text-center font-bold text-sm md:text-lg relative z-10 transition-all duration-200 cursor-pointer rounded-xl border md:border-0",
                                model === "kickoff"
                                    ? "text-white bg-gradient-to-r from-accent to-orange-500 md:bg-none border-accent/40"
                                    : "text-primary/70 hover:text-primary border-primary/20"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap">
                                <Settings size={16} className="hidden md:block md:w-5 md:h-5" />
                                <span className="md:hidden">Kick-off</span>
                                <span className="hidden md:inline">Implementación Kick-off</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setModel("saas")}
                            className={cn(
                                "w-full md:flex-1 h-12 md:h-auto py-0 md:py-4 px-3 text-center font-bold text-sm md:text-lg relative z-10 transition-all duration-200 cursor-pointer rounded-xl border md:border-0",
                                model === "saas"
                                    ? "text-white bg-gradient-to-r from-accent to-orange-500 md:bg-none border-accent/40"
                                    : "text-primary/70 hover:text-primary border-primary/20"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap">
                                <Zap size={16} className="hidden md:block md:w-5 md:h-5" />
                                <span className="md:hidden">SaaS</span>
                                <span className="hidden md:inline">Suscripción SaaS</span>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* All Pricing Information Card - Top Section */}
                <motion.div
                    key={model}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-12"
                >
                    <div className="bg-gradient-to-br from-white/95 to-white/90 border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
                        {/* Header with all pricing */}
                        <div className={cn(
                            "p-8 md:p-10",
                            model === "kickoff" ? "bg-gradient-to-r from-accent/5 to-accent/10 border-b-2 border-accent/20" :
                                "bg-gradient-to-r from-primary/5 to-primary/10 border-b-2 border-primary/20"
                        )}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                {/* Left: Main Pricing */}
                                <div className="text-center md:text-left">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={cn(
                                            "p-3 rounded-2xl",
                                            model === "kickoff" ? "bg-accent/10" : "bg-primary/10"
                                        )}>
                                            <currentPlan.icon size={32} className={model === "kickoff" ? "text-accent" : "text-primary"} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-primary">{currentPlan.name}</h3>
                                            {currentPlan.badge && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent to-orange-500 text-white text-sm font-bold mt-2">
                                                    <Building size={12} />
                                                    <span>{currentPlan.badge}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* PRICE - FIX: now in one line on mobile */}
                                    <div className="flex flex-row flex-wrap items-baseline gap-2">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className="text-4xl md:text-5xl font-bold text-primary whitespace-nowrap">
                                                {currentPlan.initialCost}
                                            </span>
                                            <span className="text-primary/70 text-base sm:text-lg whitespace-nowrap">
                                                {model === "kickoff" ? "Implementación inicial" : "Base mensual"}
                                            </span>
                                        </div>
                                        <p className="text-primary/60 text-sm mt-1 w-full">
                                            {model === "kickoff"
                                                ? "Costo único de configuración"
                                                : "Suscripción mensual base"}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: User Pricing */}
                                <div className="bg-white/95 rounded-2xl p-6 shadow-lg min-w-[300px] backdrop-blur-sm">
                                    <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                                        <Users size={20} />
                                        <span>Mensualidad por usuario</span>
                                    </h4>
                                    <div className="space-y-4">
                                        {currentPlan.monthlyUsers.map((user, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/80">
                                                <div>
                                                    <h5 className="font-semibold text-primary flex items-center gap-2">
                                                        <UserCheck size={16} />
                                                        {user.role}
                                                    </h5>
                                                    <p className="text-primary/70 text-sm">{user.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={cn(
                                                        "text-2xl font-bold",
                                                        model === "kickoff" ? "text-accent" : "text-primary"
                                                    )}>
                                                        {user.price}
                                                    </div>
                                                    <div className="text-primary/60 text-sm">{user.period}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-primary/10">
                                        <div className="text-sm text-primary/60 text-center">
                                            Precios finales según cantidad de usuarios
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Section - Below */}
                        <div className="p-8 md:p-10">
                            <h4 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <Shield size={24} />
                                <span>¿Qué incluye este modelo?</span>
                            </h4>

                            <div className="grid md:grid-cols-3 gap-6">
                                {currentPlan.features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className={cn(
                                            "p-6 rounded-2xl border transition-all duration-300 hover:shadow-md backdrop-blur-sm",
                                            model === "kickoff"
                                                ? "bg-accent/5 border-accent/10 hover:border-accent/20"
                                                : "bg-primary/5 border-primary/10 hover:border-primary/20"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                model === "kickoff" ? "bg-accent/10" : "bg-primary/10"
                                            )}>
                                                <Check size={20} className={model === "kickoff" ? "text-accent" : "text-primary"} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-primary mb-2">{feature.title}</h5>
                                                <p className="text-primary/70 text-sm">{feature.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Example Calculation - FIX: mobile layout restructured */}
                            <div className="mt-12 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl p-4 sm:p-6 border border-white/20 backdrop-blur-sm">
                                <h5 className="font-bold text-primary mb-4 text-center sm:text-left">Ejemplo de inversión mensual:</h5>
                                <div className="flex flex-col items-center gap-4 text-center w-full">
                                    <div className="text-sm text-primary/70">Para un equipo de</div>
                                    <div className="flex flex-wrap justify-center items-center gap-3">
                                        <div className="bg-primary text-white px-4 py-2 rounded-full font-bold text-base leading-none whitespace-nowrap">
                                            2 Supervisores
                                        </div>
                                        <span className="text-primary/70 text-lg">y</span>
                                        <div className="bg-accent text-white px-4 py-2 rounded-full font-bold text-base leading-none whitespace-nowrap">
                                            5 Técnicos
                                        </div>
                                    </div>
                                    <div className="text-lg text-primary/70">=</div>
                                    <div className="text-2xl font-bold text-primary">
                                        {model === "kickoff" ? "$800" : "$1,200"}
                                        <span className="text-base font-normal text-primary/70"> / mes</span>
                                    </div>
                                </div>
                                <p className="text-center text-primary/60 text-sm mt-4">
                                    {model === "kickoff"
                                        ? "+ $1,500 de implementación inicial"
                                        : "Sin costos iniciales"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center"
                >
                    <div className="bg-primary rounded-2xl p-8 max-w-2xl mx-auto backdrop-blur-sm shadow-xl">
                        <h3 className="text-2xl font-bold text-white mb-4">¿No está seguro cuál elegir?</h3>
                        <p className="text-white/80 mb-6">
                            Programe una demostración personalizada y le ayudaremos a elegir la opción
                            que mejor se adapte a las necesidades específicas de su empresa.
                        </p>
                        <button className="bg-gradient-to-r from-accent to-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200">
                            Solicitar Demostración
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}