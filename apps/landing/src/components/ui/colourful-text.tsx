"use client";
import React from "react";
import { motion } from "framer-motion";

export function ColourfulText({ text }: { text: string }) {
    // strictly adhering to the accent color palette to avoid the "rainbow" look
    const colors = [
        "var(--accent)",
        "var(--accent-light)",
        "var(--accent-dark)",
        "var(--accent)", // Repeat to give more weight to the primary accent
        "var(--accent-light)",
    ];

    const [currentColors, setCurrentColors] = React.useState(colors);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            const shuffled = [...colors].sort(() => Math.random() - 0.5);
            setCurrentColors(shuffled);
            setCount((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-block whitespace-nowrap">
            {text.split("").map((char, index) => (
                <motion.span
                    key={`${char}-${count}-${index}`}
                    initial={{
                        y: 0,
                    }}
                    animate={{
                        color: currentColors[index % currentColors.length],
                        y: [0, -1.2, 0], // Subtler movement
                        scale: [1, 1.01, 1],
                        filter: ["blur(0px)", `blur(2px)`, "blur(0px)"], // Subtler blur
                        opacity: [1, 0.9, 1],
                    }}
                    transition={{
                        duration: 0.8, // Slower animation
                        delay: index * 0.05,
                    }}
                    className="inline-block whitespace-pre font-sans tracking-tight"
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
}
