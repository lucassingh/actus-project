"use client";
import React from "react";
import { FloatingNav } from "../ui/floating-navbar";
import { Home, MessageCircle, BarChart, DollarSign } from "lucide-react";

export function Navbar() {
    const navItems = [
        {
            name: "Inicio",
            link: "#home",
            icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "El Desafío",
            link: "#desafio",
            icon: <BarChart className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "La Solución",
            link: "#solucion",
            icon: <DollarSign className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Precios",
            link: "#pricing",
            icon: <DollarSign className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Contacto",
            link: "#contacto",
            icon: <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />,
        }
    ];

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />
        </div>
    );
}
