"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DottedGlowBackgroundProps = {
    className?: string;
    gap?: number;
    radius?: number;
    color?: string;
    glowColor?: string;
    opacity?: number;
    speedMin?: number;
    speedMax?: number;
};

export const DottedGlowBackground = ({
    className,
    gap = 14,
    radius = 0.8,
    color = "rgba(255, 255, 255, 0.1)",
    glowColor = "rgba(255, 255, 255, 0.4)", // Default to white-ish, will override in ProblemSection
    opacity = 0.8,
    speedMin = 0.4,
    speedMax = 1.2,
}: DottedGlowBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = canvasRef.current;
        const container = containerRef.current;
        if (!el || !container) return;

        const ctx = el.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        let stopped = false;

        const dpr = Math.max(1, window.devicePixelRatio || 1);

        const resize = () => {
            const { width, height } = container.getBoundingClientRect();
            el.width = Math.max(1, Math.floor(width * dpr));
            el.height = Math.max(1, Math.floor(height * dpr));
            el.style.width = "100%";
            el.style.height = "100%";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const ro = new ResizeObserver(resize);
        ro.observe(container);
        resize();

        let dots: { x: number; y: number; phase: number; speed: number }[] = [];

        const regenDots = () => {
            dots = [];
            const { width, height } = container.getBoundingClientRect();
            const cols = Math.ceil(width / gap) + 2;
            const rows = Math.ceil(height / gap) + 2;
            for (let i = -1; i < cols; i++) {
                for (let j = -1; j < rows; j++) {
                    const x = i * gap + (j % 2 === 0 ? 0 : gap * 0.5);
                    const y = j * gap;
                    const phase = Math.random() * Math.PI * 2;
                    const speed = speedMin + Math.random() * (speedMax - speedMin);
                    dots.push({ x, y, phase, speed });
                }
            }
        };

        regenDots();

        let last = performance.now();

        const draw = (now: number) => {
            if (stopped) return;
            last = now;
            const { width, height } = container.getBoundingClientRect();

            ctx.clearRect(0, 0, width, height);

            const time = now / 1000;

            dots.forEach((d) => {
                const mod = (time * d.speed + d.phase) % 2;
                const lin = mod < 1 ? mod : 2 - mod;
                const a = 0.1 + 0.5 * lin;

                ctx.save();
                if (a > 0.45) {
                    const glow = (a - 0.45) / 0.55;
                    ctx.shadowColor = glowColor;
                    ctx.shadowBlur = 8 * glow;
                    ctx.fillStyle = glowColor;
                } else {
                    ctx.fillStyle = color;
                }

                ctx.globalAlpha = a * opacity;
                ctx.beginPath();
                ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            raf = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            resize();
            regenDots();
        };

        window.addEventListener("resize", handleResize);
        raf = requestAnimationFrame(draw);

        return () => {
            stopped = true;
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", handleResize);
            ro.disconnect();
        };
    }, [gap, radius, color, glowColor, opacity, speedMin, speedMax]);

    return (
        <div
            ref={containerRef}
            className={cn("absolute inset-0 overflow-hidden", className)}
        >
            <canvas
                ref={canvasRef}
                className="pointer-events-none block"
            />
        </div>
    );
};
