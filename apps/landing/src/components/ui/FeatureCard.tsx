"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Zap, FileText } from "lucide-react";

export const FeatureCard = ({
    title,
    description,
    icon: Icon,
    demoInput,
    demoResponse,
}: {
    title: string;
    description: string;
    icon: any;
    demoInput: string;
    demoResponse: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative h-[400px] w-full bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -5 }}
        >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-accent/5 z-0 transition-all duration-500 group-hover:bg-accent/10" />

            <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
                    <Icon size={24} />
                </div>

                <h3 className="text-2xl font-bold text-primary-dark mb-3 font-heading">
                    {title}
                </h3>
                <p className="text-secondary-dark text-lg leading-relaxed">
                    {description}
                </p>

                {/* Hover Simulator */}
                <div className="mt-auto relative">
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute bottom-0 left-0 right-0 bg-background-dark rounded-xl p-4 shadow-2xl border border-neutral-700"
                            >
                                {/* Chat UI */}
                                <div className="flex flex-col space-y-3">
                                    <div className="self-end bg-accent/20 text-accent-light px-3 py-2 rounded-lg rounded-br-none text-xs font-medium max-w-[80%]">
                                        {demoInput}
                                    </div>
                                    <div className="self-start bg-neutral-800 text-neutral-300 px-3 py-2 rounded-lg rounded-bl-none text-xs flex items-center gap-2 max-w-[90%]">
                                        <div className="w-4 h-4 rounded-full bg-accent flex-shrink-0" />
                                        <span>{demoResponse}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isHovered && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-accent text-xs font-bold uppercase tracking-widest opacity-50">
                            Hover para probar
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
