"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Bot, MessageSquare, MoreHorizontal } from "lucide-react";

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
        let timeouts: NodeJS.Timeout[] = [];

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

                {/* Header */}
                <div className="pt-14 pb-2 px-6 bg-gray-100/90 backdrop-blur-sm border-b border-neutral-200 flex items-center justify-between z-30 relative">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                            <Bot size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-800 leading-none">Actus Bot</p>
                            <p className="text-[11px] text-green-500 font-medium flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En línea
                            </p>
                        </div>
                    </div>
                    <MoreHorizontal size={20} className="text-neutral-400" />
                </div>

                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 px-5 py-4 overflow-y-auto flex flex-col space-y-4 bg-white relative scroll-smooth no-scrollbar"
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
                                        "max-w-[85%] p-3.5 rounded-2xl text-[13px] shadow-sm leading-relaxed",
                                        msg.sender === "bot"
                                            ? "bg-primary text-white rounded-tl-none"
                                            : "bg-gray-100 text-neutral-800 rounded-tr-none border border-gray-100"
                                    )}
                                >
                                    {msg.text}
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
                                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl rounded-tl-none flex space-x-1.5 items-center shadow-sm w-fit">
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="h-4 w-full shrink-0" />
                </div>

                {/* Input Area (Mock) */}
                <div className="p-4 border-t border-neutral-200 bg-gray-100 flex items-center space-x-3 z-30 pb-8">
                    <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform cursor-pointer">
                        <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 h-10 bg-white border border-neutral-200 rounded-full px-4 flex items-center shadow-inner">
                        <span className="text-xs text-gray-400">Escribe un mensaje...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
