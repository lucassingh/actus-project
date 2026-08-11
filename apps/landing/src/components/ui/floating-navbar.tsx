"use client";
import React, { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export const FloatingNav = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: React.ReactNode;
    }[];
    className?: string;
}) => {
    const { scrollYProgress } = useScroll();

    const [visible, setVisible] = useState(true);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            let direction = current! - scrollYProgress.getPrevious()!;

            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-white/10 rounded-full bg-primary backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6 py-3 items-center justify-center space-x-6",
                    className
                )}
            >
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/logos/isologo-bg-black.svg"
                        alt="Actus IA logo"
                        width={40}
                        height={40}
                        className="h-8 w-auto"
                        priority
                    />
                </Link>

                <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
                    {navItems.map((navItem: any, idx: number) => {
                        const isHash = navItem.link.startsWith("#");
                        const LinkComponent = isHash ? "a" : Link;

                        return (
                            <LinkComponent
                                key={`link=${idx}`}
                                href={navItem.link}
                                className={cn(
                                    "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-300 dark:hover:text-neutral-300 hover:text-accent transition-colors text-sm font-medium"
                                )}
                                onClick={(e) => {
                                    if (isHash) {
                                        e.preventDefault();
                                        const targetId = navItem.link.substring(1);
                                        const element = document.getElementById(targetId);
                                        if (element) {
                                            element.scrollIntoView({ behavior: "smooth" });
                                            window.history.pushState(null, "", navItem.link);
                                        }
                                    }
                                }}
                            >
                                <span className="block sm:hidden">{navItem.icon}</span>
                                <span className="hidden sm:block">{navItem.name}</span>
                            </LinkComponent>
                        );
                    })}
                </div>

                <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`}
                    className="hidden md:block text-sm font-medium relative bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-full transition-colors shadow-lg shadow-accent/20 cursor-pointer"
                >
                    <span>Agendar</span>
                </a>
            </motion.div>
        </AnimatePresence>
    );
};
