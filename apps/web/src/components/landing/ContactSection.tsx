
"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Globe, MessageSquare } from "lucide-react";

export const ContactSection = () => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");
    };

    return (
        <section className="relative py-32 px-4 overflow-hidden bg-[#242F5B]" id="contacto">
            {/* Background Decorative Elements id de contacto */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                {/* Dotted Glow Background (Aceternity style) */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(#ffffff 1.5px, transparent 1.5px)`,
                        backgroundSize: '35px 35px',
                        maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)'
                    }}
                />

                {/* Large Background Glows */}
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] opacity-40" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-accent/10 rounded-full blur-[140px] opacity-20" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left Column: Content and Info Cards */}
                    <div className="flex flex-col space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6 backdrop-blur-sm">
                                <MessageSquare size={14} className="text-accent" />
                                <span className="text-xs font-bold text-accent uppercase tracking-widest">Hablemos</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[0.95]">
                                Lleve su planta al <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">
                                    siguiente nivel.
                                </span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-lg leading-relaxed mb-10">
                                Estamos listos para ayudarle a digitalizar el conocimiento técnico de su empresa.
                                Contáctenos hoy y descubra el potencial de <span className="text-white font-medium">Actus IA.</span>
                            </p>
                        </motion.div>

                        {/* Contact Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: Mail,
                                    label: "Escríbanos",
                                    value: "hola@actus.ai",
                                    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                },
                                {
                                    icon: Phone,
                                    label: "Llámenos",
                                    value: "+54 9 11 1234 5678",
                                    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                },
                                {
                                    icon: MapPin,
                                    label: "Ubicación",
                                    value: "Buenos Aires, Argentina",
                                    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                },
                                {
                                    icon: Globe,
                                    label: "Redes",
                                    value: "@actus_ia",
                                    color: "bg-accent/10 text-accent border-accent/20"
                                }
                            ].map((info, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110 ${info.color}`}>
                                        <info.icon size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{info.label}</p>
                                    <p className="text-white font-medium">{info.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative group lg:mt-0 mt-8"
                    >
                        {/* Decorative background glow for the form */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                        <div className="relative w-full bg-slate-900/40 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <LabelInputContainer>
                                        <Label htmlFor="firstname" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">Nombre</Label>
                                        <Input
                                            id="firstname"
                                            placeholder="Juan"
                                            type="text"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-14 rounded-xl focus:ring-accent/50"
                                        />
                                    </LabelInputContainer>
                                    <LabelInputContainer>
                                        <Label htmlFor="lastname" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">Apellido</Label>
                                        <Input
                                            id="lastname"
                                            placeholder="Pérez"
                                            type="text"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-14 rounded-xl focus:ring-accent/50"
                                        />
                                    </LabelInputContainer>
                                </div>

                                <LabelInputContainer>
                                    <Label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        placeholder="juan.perez@empresa.com"
                                        type="email"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-14 rounded-xl focus:ring-accent/50"
                                    />
                                </LabelInputContainer>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <LabelInputContainer>
                                        <Label htmlFor="company" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">Empresa</Label>
                                        <Input
                                            id="company"
                                            placeholder="Nombre de su empresa"
                                            type="text"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-14 rounded-xl focus:ring-accent/50"
                                        />
                                    </LabelInputContainer>
                                    <LabelInputContainer>
                                        <Label htmlFor="employees" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">Empleados</Label>
                                        <select
                                            id="employees"
                                            defaultValue=""
                                            className="flex h-14 w-full border border-white/10 bg-white/5 text-white shadow-input rounded-xl px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-accent/50 transition duration-400 appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled className="bg-slate-900">Seleccione una opción</option>
                                            <option value="5" className="bg-slate-900">1 - 50</option>
                                            <option value="10" className="bg-slate-900">51 - 200</option>
                                            <option value="15" className="bg-slate-900">201 - 500</option>
                                            <option value="other" className="bg-slate-900">500+</option>
                                        </select>
                                    </LabelInputContainer>
                                </div>

                                <LabelInputContainer>
                                    <Label htmlFor="message" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">Consulta</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="¿En qué podemos ayudarle?"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[120px] rounded-xl focus:ring-accent/50"
                                    />
                                </LabelInputContainer>

                                <button
                                    className="group/btn relative bg-accent w-full text-white font-bold h-14 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,88,14,0.3)] active:scale-[0.98] text-lg flex items-center justify-center gap-2"
                                    type="submit"
                                >
                                    <span className="relative z-10">Enviar Mensaje</span>
                                    <Send size={18} className="relative z-10 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                </button>

                                <p className="text-center text-xs text-slate-500 font-medium">
                                    Al enviar, acepta nuestra <span className="text-slate-400 underline cursor-pointer">política de privacidad</span>.
                                </p>
                            </form>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};
