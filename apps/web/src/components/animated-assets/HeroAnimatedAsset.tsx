"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import bgWs from "@/assets/ws-ui/bg-ws.png";
import headerWs from "@/assets/ws-ui/header-ws.svg";
import footerWs from "@/assets/ws-ui/footer-ws.svg";

type Message = {
    id: string;
    sender: "bot" | "user";
    text: string;
    delay?: number;
};

const sequence: Message[] = [
    {
        id: "welcome",
        sender: "bot",
        text: "Hola soy Actus tu asistente de mantenimiento, ¿en qué te puedo ayudar?",
        delay: 0.5,
    },
    {
        id: "user-query",
        sender: "user",
        text: "Tengo un problema con el MOTOR-1000, hace un ruido fuerte, es un incidente de prioridad crítica y está ubicado en la planta 1 sector C",
        delay: 2.5,
    },
    {
        id: "bot-response",
        sender: "bot",
        text: "Encontré incidentes similares donde se reportaron ruidos extraños como metálicos y la solución fue cambiar la correa de distribución.",
        delay: 5.5, // Allow time for "thinking"
    },
    {
        id: "user-confirm",
        sender: "user",
        text: "Funcionó la solución que me propusiste, cambié la correa y el ruido desapareció.",
        delay: 9.5,
    },
    {
        id: "bot-success",
        sender: "bot",
        text: "¡Me alegro haberte ayudado, podés volver cuando necesites!",
        delay: 11.5,
    },
];

export const HeroAnimatedAsset = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [key, setKey] = useState(0);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping]);

    useEffect(() => {
        let timeouts: ReturnType<typeof setTimeout>[] = [];

        setMessages([]);
        setIsTyping(false);

        const runSequence = () => {
            // 1. Welcome (Instant or slight delay)
            timeouts.push(setTimeout(() => {
                setMessages((prev) => [...prev, sequence[0]]);
            }, sequence[0].delay! * 1000));

            // 2. User Query
            timeouts.push(setTimeout(() => {
                setMessages((prev) => [...prev, sequence[1]]);
                // Typing only for next bot response
                timeouts.push(setTimeout(() => setIsTyping(true), 800));
            }, sequence[1].delay! * 1000));

            // 3. Bot Response
            timeouts.push(setTimeout(() => {
                setIsTyping(false);
                setMessages((prev) => [...prev, sequence[2]]);
            }, sequence[2].delay! * 1000));

            // 4. User Confirm
            timeouts.push(setTimeout(() => {
                setMessages((prev) => [...prev, sequence[3]]);
                // Short typing for final pleasantry
                timeouts.push(setTimeout(() => setIsTyping(true), 800));
            }, sequence[3].delay! * 1000));

            // 5. Bot Success
            timeouts.push(setTimeout(() => {
                setIsTyping(false);
                setMessages((prev) => [...prev, sequence[4]]);
            }, sequence[4].delay! * 1000));

            // Loop Restart - Extended time for reading
            timeouts.push(setTimeout(() => {
                setKey(prev => prev + 1);
            }, 20000));
        };

        runSequence();

        return () => timeouts.forEach(clearTimeout);
    }, [key]);

    return (
        <div className="relative mx-auto h-[690px] w-auto aspect-[462/944] shadow-2xl rounded-[4.5rem] flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
            {/* Real iPhone Frame */}
            <img
                src="/iphone-17.svg"
                alt="iPhone Frame"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Content Container - Positioned to align with the white screen in SVG */}
            <div className="absolute top-[1.7%] bottom-[1.7%] left-[4.6%] right-[4.6%] bg-white rounded-[50px] overflow-hidden flex flex-col z-20">

                {/* Dynamic Island Overlay (to cover scrolling text) */}
                <div className="absolute top-[2.5%] left-1/2 -translate-x-1/2 w-[28%] h-[3.5%] bg-black rounded-full z-50 pointer-events-none" />

                {/* Header (real WhatsApp header mockup) */}
                <img src={headerWs.src} alt="" className="w-full h-auto shrink-0 relative z-30" />

                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 px-4 py-4 overflow-y-auto flex flex-col space-y-2.5 relative scroll-smooth no-scrollbar"
                    style={{
                        backgroundImage: `url(${bgWs.src})`,
                        backgroundSize: "260px",
                        backgroundRepeat: "repeat",
                        backgroundColor: "#EFE7DE",
                    }}
                >
                    {/* Spacer */}
                    <div className="h-2 w-full shrink-0" />

                    <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "flex w-full",
                                    msg.sender === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] px-3 py-2 rounded-lg text-[12.5px] shadow-sm leading-relaxed flex flex-wrap items-end gap-x-1.5",
                                        msg.sender === "bot"
                                            ? "bg-white text-neutral-800 rounded-tl-none"
                                            : "text-neutral-900 rounded-tr-none"
                                    )}
                                    style={msg.sender === "user" ? { backgroundColor: "#DCF7C5" } : undefined}
                                >
                                    <span>{msg.text}</span>
                                    {msg.sender === "user" && (
                                        <CheckCheck size={14} className="shrink-0 mb-0.5" style={{ color: "#3497F9" }} />
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="flex justify-start w-full"
                            >
                                <div className="bg-white p-3 rounded-lg rounded-tl-none flex space-x-1.5 items-center shadow-sm w-fit">
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: "#1DAB61" }}
                                    />
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: "#1DAB61" }}
                                    />
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: "#1DAB61" }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="h-4 w-full shrink-0" />
                </div>

                {/* Footer (real WhatsApp input bar mockup) */}
                <img src={footerWs.src} alt="" className="w-full h-auto shrink-0 relative z-30" />
            </div>
        </div>
    );
};
