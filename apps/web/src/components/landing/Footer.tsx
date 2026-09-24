"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Share2, Users, Mail } from "lucide-react";
import StrokeLogo from "../ui/StrokeLogo";

export const Footer = () => {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    // Remove scroll-linked progress variables that cause "ugly" animations
    const pathLength = 1000;

    // Links del sitio
    const siteLinks = [
        { label: "Inicio", href: "/" },
        { label: "Características", href: "/features" },
        { label: "Soluciones", href: "/solutions" },
        { label: "Sobre Nosotros", href: "/about" },
        { label: "Contacto", href: "/contact" },
    ];

    // Links de redes sociales
    const socialLinks = [
        { icon: <Share2 size={24} />, label: "Instagram", href: "https://instagram.com" },
        { icon: <Users size={24} />, label: "LinkedIn", href: "https://linkedin.com" },
        { icon: <Mail size={24} />, label: "Email", href: "mailto:info@actus-ia.com" },
    ];

    // Animaciones para el título
    const titleVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const wordVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const linkVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        }),
        hover: {
            x: 10,
            color: "var(--accent)",
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        }
    };

    const socialVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
                delay: i * 0.1 + 0.3,
                duration: 0.5,
                ease: "easeOut"
            }
        }),
        hover: {
            scale: 1.2,
            color: "var(--accent)",
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        }
    };

    const logoVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <footer
            ref={containerRef}
            className="w-full bg-white relative overflow-hidden"
        >

            <div className="relative z-20 h-full">
                {/* Sección superior con título */}
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="mb-12 flex justify-center"
                        >
                            <Image
                                src="/logos/logo-bg-white.svg"
                                alt="Actus IA Logo"
                                width={200}
                                height={60}
                                className="h-auto block mx-auto"
                            />
                        </motion.div>

                        {/* Título animado */}
                        <motion.h1
                            variants={titleVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1] mb-8"
                        >
                            <motion.span
                                variants={wordVariants}
                                className="block mb-2 text-primary"
                            >
                                Captura, aprende, resuelve.
                            </motion.span>
                            <motion.span
                                variants={wordVariants}
                                className="block mb-2 text-primary"
                            >
                                <span className="text-accent">Tu fábrica</span>, más inteligente cada día.
                            </motion.span>
                        </motion.h1>

                        {/* Subtítulo sutil */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Transformamos tu producción con inteligencia artificial en tiempo real
                        </motion.p>
                    </div>
                </div>

                {/* Sección inferior con tres columnas */}
                <div
                    className="bg-[#051225] text-white pt-20 pb-10 px-4"
                >
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Columna 1 - Logo animado (6 cols) */}
                        <motion.div
                            className="lg:col-span-6 flex items-center justify-center lg:justify-start"
                            variants={logoVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <div className="relative w-full max-w-lg">
                                {/* Logo principal con animación de stroke */}
                                <div className="relative">
                                    {/* Fondo sutil */}
                                    <StrokeLogo
                                        className="w-full h-auto opacity-10"
                                    />

                                    {/* Capa animada - Individual letters for staggered animation */}
                                    <div className="absolute inset-0">
                                        <svg
                                            width="359"
                                            height="118"
                                            viewBox="0 0 359 118"
                                            className="w-full h-auto"
                                        >
                                            {/* Icon Part 1 */}
                                            <motion.path
                                                d="M42.452 10.812C48.168-1.368 64.17-2.595 71.54 6.268l36.147 71.5c-17.374-10.173-36.083-3.05-51.318 8.412-3.932 2.956-11.433 10.146-18.758 16.693-3.675 3.285-7.313 6.416-10.464 8.802-1.576 1.193-3.023 2.194-4.285 2.932-1.112.652-2.052 1.082-2.795 1.273l-.305.067c-7.474 1.345-13.374-1.648-16.584-6.786-3.22-5.154-3.769-12.529-.364-19.973C14.376 63.883 29.554 37.09 42.45 10.82z"
                                                stroke="#ffffff"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
                                            />
                                            {/* Icon Part 2 */}
                                            <motion.path
                                                d="M62.24 89.915c12.12-10.474 27.195-14.155 41.612-7.57 5.58 2.547 9.833 6.288 11.694 10.887 1.851 4.574 1.376 10.1-2.705 16.334-1.832 2.8-3.761 4.635-5.747 5.721-1.98 1.083-4.044 1.436-6.177 1.233-4.295-.41-8.88-3.081-13.534-6.679-4.649-3.594-9.265-8.026-13.674-11.894-4.055-3.557-7.957-6.658-11.47-8.032Z"
                                                stroke="#EA580E"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
                                            />
                                            {/* Letter S */}
                                            <motion.path
                                                d="M357.749 80.94q0-5.31-3.42-8.55-3.33-3.33-10.8-5.04l-4.41-1.081q-2.79-.63-3.96-1.62-1.08-1.08-1.08-2.52 0-2.025 1.74-3.1l.241-.14q1.979-1.08 5.489-1.08 2.25 0 4.591.54 2.34.54 4.229 1.26t2.97 1.35a5.2 5.2 0 0 0 1.71-1.89q.63-1.101.709-2.48l.012-.4q0-2.108-1.741-3.664l-.24-.205q-1.98-1.62-5.399-2.43-3.33-.9-7.651-.9-8.46 0-13.139 3.69l-.288.227q-4.393 3.555-4.393 9.222 0 5.13 3.15 8.28 3.24 3.06 9.901 4.5l5.04 1.17q2.79.63 4.05 1.8 1.35 1.17 1.349 3.06l-.007.283q-.226 4.308-7.463 4.308v-1c2.42 0 4.067-.378 5.08-1 .932-.573 1.39-1.388 1.39-2.59 0-.927-.297-1.634-.884-2.194l-.121-.11-.025-.024c-.57-.53-1.521-1.015-2.948-1.399l-.642-.158-.006-.002-5.025-1.167c-4.248-.918-7.589-2.342-9.922-4.342l-.453-.408-.011-.01-.01-.10c-2.316-2.316-3.443-5.345-3.443-8.987 0-4.213 1.707-7.655 5.07-10.242 3.357-2.642 7.983-3.897 13.75-3.897 2.935 0 5.565.304 7.881.926 2.227.528 4.084 1.318 5.521 2.408l.282.221c1.516 1.241 2.347 2.802 2.347 4.645l-.014.457c-.061 1.057-.335 2.036-.839 2.918a6.2 6.2 0 0 1-2.023 2.227l-.519.346-.54-.314c-.49-.286-1.137-.598-1.951-.935l-.87-.345a31.4 31.4 0 0 0-4.1-1.22 19.4 19.4 0 0 0-4.365-.515c-2.257 0-3.898.35-5.011.958-.535.292-.888.63-1.11.994-.222.362-.349.807-.349 1.368 0 .665.234 1.246.758 1.783.523.429 1.441.855 2.853 1.224l.65.158.017.004 4.395 1.076c5.059 1.159 8.872 2.896 11.284 5.308 2.493 2.372 3.713 5.492 3.713 9.258l-.005.418c-.104 4.3-1.824 7.76-5.162 10.28l-.003.001c-3.364 2.523-8.173 3.71-14.28 3.71-4.949 0-9.095-.732-12.389-2.252l-.007-.003c-3.244-1.527-5.164-3.723-5.164-6.665 0-1.282.271-2.45.852-3.466l.013-.022.014-.023a7.8 7.8 0 0 1 2.37-2.37l.541-.347.541.347q2.422 1.559 5.578 2.788c2.085.788 4.51 1.194 7.291 1.194v1l-.536-.005q-3.992-.075-7.114-1.256-3.24-1.26-5.76-2.88-1.26.81-2.07 2.07-.72 1.26-.72 2.97 0 3.6 4.59 5.76 4.68 2.16 11.97 2.16 8.719 0 13.384-3.294l.296-.216q4.622-3.487 4.766-9.508z"
                                                stroke="white"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeInOut", delay: 1.0 }}
                                            />
                                            {/* Letter U */}
                                            <motion.path
                                                d="M300.645 49.827l.649-.243c.573-.216 1.331-.375 2.233-.498a17.6 17.6 0 0 1 3.247-.287c2.269 0 4.136.387 5.37 1.37h.001l.011.10.20.015h-.001c1.322 1.013 1.809 2.794 1.809 4.916v29.52c0 1.492-.259 2.824-.825 3.956l-.012.024c-.598 1.122-1.638 2.052-2.996 2.828-1.788 1.14-4.067 2.067-6.808 2.798-2.8.746-5.95 1.113-9.438 1.113-3.975 0-7.53-.567-10.647-1.724l-.617-.238-.007-.003c-3.031-1.248-5.448-3.124-7.221-5.63l-.347-.508c-1.815-2.788-2.681-6.324-2.681-10.537V49.827l.649-.243c.581-.218 1.375-.378 2.333-.5a17.6 17.6 0 0 1 3.237-.285c2.204 0 4.028.386 5.257 1.354 1.419 1.002 1.953 2.8 1.953 4.957v21.42l.10.531c.083 2.426.741 4.086 1.829 5.148l.241.22c1.383 1.178 3.375 1.83 6.101 1.83v1l-.533-.008q-3.677-.113-5.906-1.811l-.311-.25q-2.279-1.94-2.421-6.097l-.10-.563V55.11q0-3.06-1.529-4.14-1.44-1.17-4.681-1.17-1.619 0-3.059.27l-.675.096q-.945.15-1.485.353v26.19q0 6.12 2.52 9.99t7.11 5.76q4.387 1.773 10.12 1.883l.77.007q4.81 0 8.669-.95l.511-.13q3.796-1.012 6.249-2.499l.321-.2q1.89-1.08 2.61-2.43.72-1.44.719-3.51V55.11q0-3.06-1.439-4.14-1.44-1.17-4.771-1.17-1.619 0-3.059.27l-.636.096q-.895.15-1.434.353v33.03q-.99.63-2.97 1.17-1.89.54-4.68.54v-1c1.803 0 3.263-.174 4.405-.5l.012-.005c.965-.263 1.7-.53 2.233-.792z"
                                                stroke="white"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
                                            />
                                            {/* Letter T */}
                                            <motion.path
                                                d="M238.111 38.399l.758-.19c.503-.125 1.212-.28 2.116-.46l.012-.002.388-.068q1.366-.22 2.857-.22c2.17 0 3.971.395 5.196 1.377h.001q.004.002.007.006l.016.011-.001.001c1.361 1.056 1.9 2.808 1.9 4.915v6.47h12.745l.299.42c.34.475.618 1.08.854 1.78l.098.307c.274.89.405 1.861.405 2.904l-.005.306c-.047 1.517-.45 2.827-1.34 3.791l-.014.015-.014.015c-.941.94-2.173 1.373-3.587 1.373h-9.441v18.619c0 1.72.502 2.74 1.297 3.33.973.676 2.392 1.07 4.363 1.07v1q-2.953 0-4.719-1.107l-.231-.152q-1.71-1.26-1.71-4.141v-19.62h10.441l.221-.004q1.537-.06 2.521-.944l.138-.131q1.013-1.097 1.076-3.144l.004-.276q0-1.26-.276-2.314l-.085-.297q-.36-1.17-.809-1.8h-13.231v-7.47q0-2.97-1.529-4.14-1.35-1.095-4.203-1.165l-.387-.005q-1.62 0-3.06.27-1.35.27-2.071.45v41.31l.004.458q.123 7.023 4.047 10.163 3.881 2.952 10.372 3.138l.878.011q5.063 0 7.515-1.503l.315-.207q2.278-1.687 2.42-4.166l.10-.334q0-1.35-.54-2.34-.45-1.08-1.17-1.8-1.17.45-2.88.9-1.62.36-3.061.36v-1q1.305.001 2.819-.33c1.112-.294 2.03-.581 2.763-.863l.606-.233.46.46c.575.575 1.027 1.276 1.368 2.082.435.82.635 1.752.635 2.764l-.012.4c-.116 1.98-1.099 3.627-2.823 4.904l-.10.007-.10.008c-1.878 1.321-4.746 1.891-8.405 1.891-4.727 0-8.618-1.014-11.573-3.144l-.282-.21-.20-.015c-3.025-2.42-4.426-6.311-4.426-11.4z"
                                                stroke="white"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeInOut", delay: 0.6 }}
                                            />
                                            {/* Letter C */}
                                            <motion.path
                                                d="M204.788 71.76q0-6.57 3.6-10.08 3.69-3.51 9-3.51 3.06 0 5.31.9 2.047.708 3.613 1.554l.437.246a7.7 7.7 0 0 0 1.614-1.624l.186-.266a4.8 4.8 0 0 0 .709-2.255l.011-.355q0-3.06-3.6-5.13-3.375-2.025-8.886-2.152l-.744-.008q-6.12 0-11.34 2.52l-.644.324q-4.773 2.511-7.726 7.236-3.06 5.04-3.06 12.6 0 7.47 2.88 12.509 2.88 4.95 8.1 7.47 4.978 2.363 11.301 2.51l.849.10q5.654 0 9.17-1.74l.46-.24q3.46-1.856 3.675-4.661l.015-.378q0-1.62-.72-2.7-.72-1.17-2.07-2.07-1.71.99-4.05 1.89-2.34.81-5.49.81v-1c2.011 0 3.722-.26 5.15-.752q2.27-.876 3.889-1.814l.538-.312.517.345c.988.658 1.781 1.438 2.348 2.348.614.92.888 2.026.888 3.255l-.004.236c-.095 2.427-1.648 4.308-4.213 5.685l-.001-.001c-2.599 1.427-5.991 2.1-10.102 2.1-4.391 0-8.358-.76-11.88-2.299l-.699-.318-.006-.003c-3.657-1.766-6.508-4.393-8.53-7.868l-.004-.006c-2.027-3.548-3.011-7.901-3.011-13.007 0-5.172 1.047-9.564 3.206-13.119l.005-.10c2.198-3.516 5.13-6.167 8.785-7.931 3.623-1.75 7.552-2.62 11.774-2.62 4.118 0 7.52.735 10.127 2.294h.001c2.585 1.486 4.102 3.474 4.102 5.997l-.013.422a5.8 5.8 0 0 1-.856 2.711l-.019.032a8.7 8.7 0 0 1-2.032 2.134l-.529.397-.572-.331q-1.407-.816-3.319-1.522l-.557-.199-.022-.008-.023-.008c-1.355-.542-2.994-.829-4.938-.829-3.292 0-6.039 1.077-8.303 3.226l.001.001c-2.153 2.099-3.298 5.167-3.298 9.363l.013.776c.126 3.678 1.165 6.404 3.002 8.304l.193.195c2.127 2.072 4.894 3.135 8.392 3.135v1q-5.58 0-9.09-3.42-3.29-3.206-3.496-9.18z"
                                                stroke="white"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
                                            />
                                            {/* Letter A */}
                                            <motion.path
                                                d="M162.45 36.65c2.25 0 4.313.343 6.175 1.045l.001-.001c1.964.677 3.352 1.89 3.952 3.687q1.893 4.875 3.959 11.248 1.621 4.798 3.294 9.898l1.12 3.433q2.25 6.932 4.232 13.505a559 559 0 0 1 2.806 9.028l.801 2.695.148.507-.334.408c-.682.833-1.656 1.458-2.841 1.919-1.222.535-2.611.787-4.143.787-2.162 0-3.952-.36-5.125-1.299l-.028-.022-.028-.026c-1.018-.945-1.748-2.33-2.256-4.045v.001l-2.506-8.289h-18.701l-.268.872-.278 1.045q-.427 1.567-.904 3.135a158 158 0 0 1-1.267 3.984 108 108 0 0 0-.883 3.092l-.134.504-.49.178q-1.041.378-2.17.66c-.772.208-1.701.3-2.762.3-2.016 0-3.738-.359-5.073-1.175l-.262-.169-.014-.10-.014-.10c-1.413-1.042-2.117-2.52-2.117-4.316q0-1.207.306-2.333l.006-.026.813-2.438a525 525 0 0 1 2.343-7.477l.005-.018q1.531-4.502 3.332-9.723l.002-.008.002-.007 3.781-10.44a717 717 0 0 1 3.603-9.909q1.711-4.592 2.883-7.658l.133-.347.327-.176c.882-.475 2.14-.919 3.724-1.345a18.6 18.6 0 0 1 4.85-.664m.36 11.35q.9 2.7 2.07 6.57 1.26 3.78 2.7 8.19a211 211 0 0 1 2.517 8.1h-15.539q.486-1.463.985-2.97l1.417-4.32q.765-2.205 1.485-4.32l1.395-4.14q1.44-4.05 2.52-7.11zm-2.028 7.445a732 732 0 0 1-2.873 8.434l.001.001q-1.005 3.078-1.967 5.98h12.821a212 212 0 0 0-2.133-6.784l-.002-.006v-.001q-.72-2.205-1.394-4.25l-1.303-3.934-.005-.012-.004-.014a312 312 0 0 0-1.37-4.413q-.804 2.276-1.771 4.999"
                                                stroke="white"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                                            />
                                            {/* Letter I */}
                                            <motion.path
                                                d="M137.34 89.219q0 2.25 1.71 3.51 1.603 1.098 4.392 1.166l.378.005q1.53 0 2.52-.27 1.08-.27 2.07-.63.36-1.35.9-3.15.315-.945.63-1.935l.63-2.026q.473-1.553.895-3.104l.275-1.035.497-1.62h20.182l2.721 9q.72 2.43 1.98 3.6 1.266 1.012 4.113 1.075l.387.004q2.16 0 3.78-.72 1.62-.63 2.43-1.62-1.53-5.22-3.6-11.7-1.98-6.57-4.23-13.5a1212 1212 0 0 0-3.324-10.09l-1.086-3.23q-2.07-6.39-3.96-11.25-.72-2.16-3.33-3.06-2.447-.928-5.447-.985l-.403-.004q-2.25 0-4.59.63l-.567.157q-1.92.551-2.943 1.102-1.17 3.06-2.88 7.65t-3.6 9.9l-3.78 10.44q-1.8 5.22-3.33 9.72-1.44 4.5-2.34 7.47l-.81 2.43q-.27.99-.27 2.07"
                                                stroke="white"
                                                strokeWidth="2"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Columna 2 - Links del sitio (3 cols) */}
                        <motion.div
                            className="lg:col-span-3"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            <motion.h3
                                className="text-xl font-semibold mb-6 text-accent"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Navegación
                            </motion.h3>
                            <ul className="space-y-3">
                                {siteLinks.map((link, i) => (
                                    <motion.li
                                        key={link.href}
                                        custom={i}
                                        variants={linkVariants}
                                        whileHover="hover"
                                        className="overflow-hidden"
                                    >
                                        <a
                                            href={link.href}
                                            className="group flex items-center gap-2 text-white hover:text-accent transition-all duration-200 py-1"
                                        >
                                            <motion.span
                                                className="inline-block w-0 group-hover:w-3 h-[2px] bg-accent transition-all duration-200"
                                            />
                                            <span className="text-lg">{link.label}</span>
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Columna 3 - Redes sociales (3 cols) */}
                        <motion.div
                            className="lg:col-span-3"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            <motion.h3
                                className="text-xl font-semibold mb-6 text-accent"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Conéctate con Nosotros
                            </motion.h3>
                            <div className="space-y-4">
                                <motion.p
                                    className="text-gray-300 mb-4"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Síguenos en nuestras redes sociales para estar al tanto de las últimas novedades.
                                </motion.p>
                                <div className="flex flex-col gap-3">
                                    {socialLinks.map((social, i) => (
                                        <motion.a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            custom={i}
                                            variants={socialVariants}
                                            whileHover="hover"
                                            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200"
                                        >
                                            <motion.span
                                                className="text-white group-hover:text-accent transition-colors duration-200"
                                                whileHover={{ rotate: 10 }}
                                            >
                                                {social.icon}
                                            </motion.span>
                                            <span className="text-white group-hover:text-accent transition-colors duration-200">
                                                {social.label}
                                            </span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Copyright */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-16 pt-8 border-t border-white/10 text-center text-gray-400 text-sm"
                    >
                        <p>© {new Date().getFullYear()} Actus IA. Todos los derechos reservados.</p>
                        <p className="mt-2 text-xs opacity-70">Transformando la industria con inteligencia artificial</p>
                    </motion.div>
                </div>
            </div>
        </footer>
    );
};