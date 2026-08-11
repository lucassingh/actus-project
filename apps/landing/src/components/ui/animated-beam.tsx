"use client";

import { RefObject, useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
    className?: string;
    containerRef: RefObject<HTMLElement | null>; // Container ref
    fromRef: RefObject<HTMLElement | null>;
    toRef: RefObject<HTMLElement | null>;
    curvature?: number;
    reverse?: boolean;
    pathColor?: string;
    pathWidth?: number;
    pathOpacity?: number;
    gradientStartColor?: string;
    gradientStopColor?: string;
    delay?: number;
    duration?: number;
    startXOffset?: number;
    startYOffset?: number;
    endXOffset?: number;
    endYOffset?: number;
}

export const AnimatedBeam = ({
    className,
    containerRef,
    fromRef,
    toRef,
    curvature = 0,
    reverse = false,
    duration = Math.random() * 3 + 4,
    delay = 0,
    pathColor = "gray",
    pathWidth = 2,
    pathOpacity = 0.2,
    gradientStartColor = "#ffaa40",
    gradientStopColor = "#9c40ff",
    startXOffset = 0,
    startYOffset = 0,
    endXOffset = 0,
    endYOffset = 0,
}: AnimatedBeamProps) => {
    const id = useId().replace(/:/g, "");
    const [pathD, setPathD] = useState("");
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

    // Calculate the bezier path
    useEffect(() => {
        const updatePath = () => {
            if (containerRef.current && fromRef.current && toRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const rectA = fromRef.current.getBoundingClientRect();
                const rectB = toRef.current.getBoundingClientRect();

                const svgWidth = containerRect.width;
                const svgHeight = containerRect.height;
                setSvgDimensions({ width: svgWidth, height: svgHeight });

                const startX =
                    rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
                const startY =
                    rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
                const endX =
                    rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
                const endY =
                    rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

                const controlY = startY - curvature;
                const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
                setPathD(d);
            }
        };

        // Initialize ResizeObserver
        const resizeObserver = new ResizeObserver((entries) => {
            // For simplicity, just update path on any resize
            updatePath();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        // Also observe the elements if possible, or just hook into window resize
        window.addEventListener("resize", updatePath);

        // Initial update
        const timeout = setTimeout(updatePath, 50);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePath);
            clearTimeout(timeout);
        };
    }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

    const pathId = `${id}-path`;

    return (
        <svg
            fill="none"
            width={svgDimensions.width}
            height={svgDimensions.height}
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
                "pointer-events-none absolute left-0 top-0 stroke-2",
                className
            )}
        >
            <path
                id={pathId}
                d={pathD}
                stroke={pathColor}
                strokeWidth={pathWidth}
                strokeOpacity={pathOpacity}
                strokeLinecap="round"
            />
            <path
                d={pathD}
                stroke={`url(#${id})`}
                strokeWidth={pathWidth}
                strokeOpacity="1"
                strokeLinecap="round"
            />
            <defs>
                <motion.linearGradient
                    className="transform-gpu"
                    id={id}
                    gradientUnits="userSpaceOnUse"
                    initial={{
                        x1: "0%",
                        x2: "0%",
                        y1: "0%",
                        y2: "0%",
                    }}
                    animate={{
                        x1: ["0%", "100%"],
                        x2: ["0%", "100%"],
                        y1: ["0%", "0%"],
                        y2: ["0%", "0%"],
                    }}
                    transition={{
                        delay,
                        duration,
                        ease: [0.16, 1, 0.3, 1],
                        repeat: Infinity,
                        repeatDelay: 0,
                    }}
                >
                    <stop stopColor={gradientStartColor} stopOpacity="0" />
                    <stop stopColor={gradientStartColor} />
                    <stop offset="32.5%" stopColor={gradientStopColor} />
                    <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
                </motion.linearGradient>
            </defs>

            {/* Moving Particle/Packet */}
            <circle r="3" fill={gradientStartColor}>
                <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                    keyPoints={reverse ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                >
                    <mpath href={`#${pathId}`} />
                </animateMotion>
            </circle>
            {/* Glow for the particle */}
            <circle r="6" fill={gradientStartColor} opacity="0.4">
                <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                    keyPoints={reverse ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                >
                    <mpath href={`#${pathId}`} />
                </animateMotion>
            </circle>
        </svg>
    );
};
