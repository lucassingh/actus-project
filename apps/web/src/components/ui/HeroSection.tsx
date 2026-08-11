"use client";

import { motion } from "framer-motion";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { ReactNode } from "react";

interface HeroSectionProps {
    id?: string;
    bgColor?: string;
    bgOpacity?: number;
    titleColor?: string;
    subtitleColor?: string;
    title: ReactNode;
    subtitle: ReactNode;
    smallTitle?: string;
    rippleColor?: string;
    className?: string;
    animateGradient?: boolean;
    gradientColors?: {
        from: string;
        to: string;
    };
}

export function HeroSection({
    id = "solution",
    bgColor = "bg-slate-950",
    bgOpacity = 90,
    titleColor = "text-white",
    subtitleColor = "text-slate-300",
    title,
    subtitle,
    smallTitle = "Solución Inteligente",
    rippleColor = "bg-white/5",
    className = ""
}: HeroSectionProps) {

    const bgOpacityClass = `opacity-${bgOpacity}`;

    return (
        <section className={`w-full flex flex-col items-center px-5 ${className}`} id={id}>
            {/* Hero Card */}
            <div className={`relative w-full min-h-[50vh] md:h-[60vh] rounded-[10px] overflow-hidden ${bgColor} border shadow-2xl mt-20 mb-32 py-12`}>
                <BackgroundRippleEffect
                    className={`absolute inset-0 ${bgOpacityClass}`}
                    cellClassName={rippleColor}
                />

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-6"
                    >
                        <h2 className={`text-sm md:text-base font-semibold tracking-wide uppercase ${titleColor} mb-2`}>
                            {smallTitle}
                        </h2>
                    </motion.div>

                    <motion.h1
                        className={`text-4xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight leading-tight ${titleColor} mb-2`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        className={`mt-8 text-lg md:text-2xl ${subtitleColor} max-w-4xl font-sans leading-relaxed`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    >
                        {subtitle}
                    </motion.p>
                </div>
            </div>
        </section>
    );
}