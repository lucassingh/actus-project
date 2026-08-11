"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 80) {
                setVisible(true);
            } else if (currentScrollY < lastScrollY) {
                setVisible(true);
            } else {
                setVisible(false);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
        if (!link.startsWith("#")) return;
        e.preventDefault();
        const el = document.getElementById(link.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div
            className={cn(
                "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-white/10 rounded-full bg-primary backdrop-blur-md shadow-lg z-[5000] px-6 py-3 items-center justify-center space-x-6 transition-all duration-200",
                visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none",
                className
            )}
        >
            <a href="/" className="flex items-center space-x-2">
                <Image
                    src="/logos/isologo-bg-black.svg"
                    alt="Actus IA logo"
                    width={40}
                    height={40}
                    className="h-8 w-auto"
                    priority
                />
            </a>

            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
                {navItems.map((navItem, idx) => (
                    <a
                        key={idx}
                        href={navItem.link}
                        onClick={(e) => handleNavClick(e, navItem.link)}
                        className="relative items-center flex space-x-1 text-neutral-300 hover:text-accent transition-colors text-sm font-medium"
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block">{navItem.name}</span>
                    </a>
                ))}
            </div>

            <a
                href="/sign-in"
                className="text-sm font-medium bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-full transition-colors shadow-lg shadow-accent/20 whitespace-nowrap"
            >
                Iniciar sesión
            </a>
        </div>
    );
};
