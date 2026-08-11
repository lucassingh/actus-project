"use client";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface EncryptedTextProps {
    text: string;
    className?: string;
    encryptedClassName?: string;
    revealedClassName?: string;
    revealDelayMs?: number; // Delay between revealing each character
    flipDelayMs?: number; // Delay between character flips
    charset?: string;
    startDelay?: number; // When to start the whole animation
}

export const EncryptedText = ({
    text,
    className,
    encryptedClassName,
    revealedClassName,
    revealDelayMs = 50,
    flipDelayMs = 50,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?",
    startDelay = 0,
}: EncryptedTextProps) => {
    const [currentText, setCurrentText] = useState(text);
    const revealedCountRef = useRef(0);
    const flipIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Cleanup function
        const cleanup = () => {
            if (flipIntervalRef.current) clearInterval(flipIntervalRef.current);
            if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
            if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
        };

        // Reset on text change or initial mount
        cleanup();
        revealedCountRef.current = 0;

        // Initial scramble state before delay
        setCurrentText(text.split("").map(() => charset[Math.floor(Math.random() * charset.length)]).join(""));

        const startAnimation = () => {
            // Interval for flipping random characters (visual effect)
            flipIntervalRef.current = setInterval(() => {
                setCurrentText((_prev) => {
                    return text
                        .split("")
                        .map((char, index) => {
                            if (index < revealedCountRef.current) {
                                return text[index];
                            }
                            // Scramble unrevealed characters
                            return charset[Math.floor(Math.random() * charset.length)];
                        })
                        .join("");
                });
            }, flipDelayMs);

            // Interval for revealing characters (logic)
            revealIntervalRef.current = setInterval(() => {
                if (revealedCountRef.current < text.length) {
                    revealedCountRef.current += 1;
                } else {
                    cleanup(); // Stop all animations
                    setCurrentText(text); // Ensure final state
                }
            }, revealDelayMs);
        };

        // Start delay
        startTimeoutRef.current = setTimeout(startAnimation, startDelay * 1000);

        return cleanup;
    }, [text, charset, revealDelayMs, flipDelayMs, startDelay]);

    return (
        <span className={cn("inline-block font-mono", className)}>
            {currentText.split("").map((char, index) => {
                const isRevealed = index < revealedCountRef.current;
                return (
                    <span
                        key={index}
                        className={cn(
                            isRevealed ? revealedClassName : encryptedClassName
                        )}
                    >
                        {char}
                    </span>
                );
            })}
        </span>
    );
};
