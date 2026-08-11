"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { HeroAnimatedAsset } from "@/components/animated-assets/HeroAnimatedAsset";
import { MessageSquareText, Mic, Image as ImageIcon, Circle } from "lucide-react";

export function OperatorsSubsection() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs for Left Column Items
    const textInputRef = useRef<HTMLDivElement>(null);
    const audioInputRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLDivElement>(null);

    // Ref for Center AI Sphere
    const aiSphereRef = useRef<HTMLDivElement>(null);

    // Ref for Right Application
    const appRef = useRef<HTMLDivElement>(null);

    return (
        <section
            ref={containerRef}
            className="w-full relative min-h-screen flex flex-col p-6 md:px-12 py-12 md:py-20 overflow-hidden bg-slate-950"
        >
            {/* Main Animation Layout */}
            <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-between relative mt-8 md:mt-0">
                {/* Left Column: Inputs */}
                <div className="w-full md:w-1/4 flex flex-row md:flex-col justify-evenly md:justify-center md:gap-12 items-center relative z-20 mb-8 md:mb-0">

                    {/* Text Input Item */}
                    <div ref={textInputRef} className="flex flex-col items-center group cursor-default">
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <MessageSquareText className="w-6 h-6 md:w-10 md:h-10 text-accent group-hover:text-white transition-colors" />
                        </div>
                        <span className="mt-2 md:mt-3 text-xs md:text-base text-slate-400 font-medium tracking-wide">Texto</span>
                    </div>

                    {/* Audio Input Item */}
                    <div ref={audioInputRef} className="flex flex-col items-center group cursor-default">
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Mic className="w-6 h-6 md:w-10 md:h-10 text-accent group-hover:text-white transition-colors" />
                        </div>
                        <span className="mt-2 md:mt-3 text-xs md:text-base text-slate-400 font-medium tracking-wide">Audio</span>
                    </div>

                    {/* Image Input Item */}
                    <div ref={imageInputRef} className="flex flex-col items-center group cursor-default">
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <ImageIcon className="w-6 h-6 md:w-10 md:h-10 text-accent group-hover:text-white transition-colors" />
                        </div>
                        <span className="mt-2 md:mt-3 text-xs md:text-base text-slate-400 font-medium tracking-wide">Imagen</span>
                    </div>

                </div>


                {/* Center Column: AI Representation */}
                <div className="w-full md:w-2/5 h-[400px] md:h-full flex items-center justify-center relative z-20 mb-12 md:mb-0">
                    <div
                        ref={aiSphereRef}
                        className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center"
                    >
                        {/* Animated AI Agent SVG */}
                        {/* Pulsing Effect Container */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <motion.div
                                className="w-full h-full flex items-center justify-center"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            >
                                <motion.img
                                    src="/IA_agent.svg"
                                    alt="AI Agent"
                                    className="w-full h-full object-contain"
                                    animate={{
                                        scale: [1, 1.02, 0.99, 1.01, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        times: [0, 0.2, 0.5, 0.8, 1]
                                    }}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Right Column: App Interface */}
                <div className="w-full md:w-1/4 flex items-center justify-center relative z-20">
                    <div ref={appRef} className="relative transform scale-90 md:scale-95 origin-center">
                        <HeroAnimatedAsset />
                    </div>
                </div>
            </div>

            {/* Beams - Made more "spectacular" with higher opacity, width and better colors */}
            {/* Inputs to AI */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={textInputRef}
                toRef={aiSphereRef}
                duration={4}
                pathColor={"rgba(249, 115, 22, 0.2)"}
                pathWidth={4}
                gradientStartColor={"#f97316"}
                gradientStopColor={"#fb923c"}
                startXOffset={0}
                className="z-0"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={audioInputRef}
                toRef={aiSphereRef}
                duration={4}
                delay={1.2}
                pathColor={"rgba(249, 115, 22, 0.2)"}
                pathWidth={4}
                gradientStartColor={"#f97316"}
                gradientStopColor={"#fb923c"}
                startXOffset={0}
                className="z-0"
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={imageInputRef}
                toRef={aiSphereRef}
                duration={4}
                delay={2.4}
                pathColor={"rgba(249, 115, 22, 0.2)"}
                pathWidth={4}
                gradientStartColor={"#f97316"}
                gradientStopColor={"#fb923c"}
                startXOffset={0}
                className="z-0"
            />

            {/* AI to App */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={aiSphereRef}
                toRef={appRef}
                duration={4}
                delay={3.5}
                pathColor={"rgba(249, 115, 22, 0.2)"}
                pathWidth={4}
                gradientStartColor={"#f97316"}
                gradientStopColor={"#fb923c"}
                className="z-0"
            />
        </section>
    );
}
