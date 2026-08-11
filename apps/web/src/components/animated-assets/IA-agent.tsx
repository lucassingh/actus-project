"use client";

import React, { useEffect, useRef } from 'react';

interface Props {
    color?: string;
    particleCount?: number;
    baseRadius?: number;
    speed?: number; // Menor es más lento (ej: 0.001)
}

const RadialVisualizer: React.FC<Props> = ({
    color = '#4A90E2',
    particleCount = 180,
    baseRadius = 150,
    speed = 0.005,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.offsetWidth / 2;
            const centerY = canvas.offsetHeight / 2;

            time += speed;

            // Dibujamos 3 capas concéntricas para dar profundidad (como en tu imagen)
            for (let layer = 0; layer < 3; layer++) {
                const layerRadius = baseRadius + (layer * 30);
                const layerAlpha = 1 - (layer * 0.3);

                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;

                    // Efecto de onda/ruido orgánico
                    const noise = Math.sin(angle * 5 + time) * 10 +
                        Math.cos(angle * 3 - time * 0.5) * 15;

                    // Glitch aleatorio suave
                    const glitch = Math.random() > 0.99 ? Math.random() * 20 : 0;

                    const r = layerRadius + noise + glitch;
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;

                    // Dibujar punto/barra
                    ctx.beginPath();
                    ctx.fillStyle = color;
                    ctx.globalAlpha = layerAlpha;

                    // Dibujamos rectángulos pequeños para imitar el efecto de "bars"
                    const barHeight = 4 + (noise * 0.5);
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    ctx.fillRect(0, 0, 2, barHeight);
                    ctx.restore();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, particleCount, baseRadius, speed]);

    return (
        <div className="relative w-full h-[500px] bg-black flex items-center justify-center overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ filter: 'blur(0.5px) Math.contrast(1.2)' }}
            />
            {/* Resplandor central opcional */}
            <div
                className="absolute w-32 h-32 rounded-full blur-[80px]"
                style={{ backgroundColor: color, opacity: 0.2 }}
            />
        </div>
    );
};

export default RadialVisualizer;