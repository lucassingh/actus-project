// components/ui/background-boxes.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BoxesProps {
    className?: string;
    boxColor?: string;
    background?: string;
}

export const Boxes = ({
    className,
    boxColor = "#F97316", // Default to accent color
    background = "transparent"
}: BoxesProps) => {
    const rows = new Array(150).fill(1);
    const cols = new Array(100).fill(1);
    let colors = [
        "--sky-300",
        "--pink-300",
        "--green-300",
        "--yellow-300",
        "--red-300",
        "--purple-300",
        "--blue-300",
        "--indigo-300",
        "--violet-300",
    ];

    // Use custom boxColor if provided
    const getBoxColor = () => {
        return boxColor;
    };

    return (
        <div
            style={{
                background,
            }}
            className={cn(
                "absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden",
                className
            )}
        >
            {rows.map((_, i) => (
                <motion.div
                    key={`row-${i}`}
                    className="absolute h-1 w-full"
                    style={{
                        boxShadow: `0 0 2px ${getBoxColor()}, 0 0 5px ${getBoxColor()}`,
                        backgroundColor: getBoxColor(),
                        top: `${i * 2}rem`,
                        opacity: 0.3,
                    }}
                    initial={{
                        scaleX: 0,
                        x: i % 2 === 0 ? -1000 : 1000,
                    }}
                    animate={{
                        scaleX: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 2,
                        delay: i * 0.02,
                        ease: "easeOut",
                    }}
                />
            ))}
            {cols.map((_, i) => (
                <motion.div
                    key={`col-${i}`}
                    className="absolute w-1 h-full"
                    style={{
                        boxShadow: `0 0 2px ${getBoxColor()}, 0 0 5px ${getBoxColor()}`,
                        backgroundColor: getBoxColor(),
                        left: `${i * 2}rem`,
                        opacity: 0.3,
                    }}
                    initial={{
                        scaleY: 0,
                        y: i % 2 === 0 ? -1000 : 1000,
                    }}
                    animate={{
                        scaleY: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 2,
                        delay: i * 0.02,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
};