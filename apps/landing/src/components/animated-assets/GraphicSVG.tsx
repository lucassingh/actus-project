"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { theme } from "@/config/theme";

export const GraphicSVG = ({ className }: { className?: string }) => {
    const draw: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 2.5, bounce: 0 },
                opacity: { duration: 0.5 },
            },
        },
    };

    const pathStyle = {
        stroke: theme.colors.accent,
        strokeWidth: 2,
        fill: "none",
        strokeMiterlimit: 10,
    };

    return (
        <motion.svg
            viewBox="0 0 317.85 317.85"
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <g transform="translate(15.9, 15.9) scale(0.9)">
                {/* Square border - Static and solid */}
                <motion.rect
                    x=".5"
                    y=".5"
                    width="316.85"
                    height="316.85"
                    rx="29.11"
                    ry="29.11"
                    variants={draw}
                    style={{ ...pathStyle, strokeWidth: 1 }}
                />

                {/* Internal Drawing with Uniform constant pulse */}
                <motion.g
                    animate={{ scale: [0.98, 1.02, 0.98] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ originX: "159px", originY: "159px" }}
                >
                    {/* Paths from the simplified graphic.svg (Downward negative trend) */}
                    <motion.path variants={draw} style={pathStyle} d="M317.35,226.02c-12.31-3.26-24.97-7.82-37.57-9.77-.74-.11-1.7-.96-1.5.45l39.08,10.39v-1.07Z" />
                    <motion.path variants={draw} style={pathStyle} d="M143.49,120.63c.73.89.64,1.89.67,2.9.68,18.61-.6,37.31.01,55.93.95,5,10.31,3.01,10.31.03v-38.36c0-.37,1.08-.72,1.62-.8,2.25-.34,12.83-.3,15.2,0,.2.3.42.3.65,0-.67-.88-2.45-.53-3.55-.54-3.69-.04-8.86-.35-12.34-.02-2.69.25-2.7,1.56-2.9,3.47-1.24,11.53,1,24.54.01,36.24-.77,3.39-7.82,3.87-8.42-1.56-1.96-17.6,1.98-37.88.08-55.49-.11-1.06-.34-1.09-.69-1.8-.18-.47-.4-.46-.65,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M94.33,171.24c.28,1.44.74,1.35,1.29,0v-69.26c-.18-.46-.4-.46-.65,0-.24.49-.99.97-.69,1.8l.05,67.45Z" />
                    <motion.path variants={draw} style={pathStyle} d="M127.97,119.03c-1.65.32-1.85,2.29-1.97,3.44-1.96,18.31,1.56,38.96-.01,57.53-.78,4.06-6.66,3.15-10.31,2.44.24.97,1.27.99,2.24,1.08,4.54.43,8.44.17,9.36-4.05.52-19.93-.84-40.1.69-59.9.56-.15.56-.33,0-.53Z" />
                    <motion.path variants={draw} style={pathStyle} d="M171.31,140.34c.74.89.63,1.89.67,2.9.53,12.55-.57,25.18.11,37.74.94,3.39,8.04,3.54,9.56.38-.1-.43-.32-.61-.65-.53-1.64,2.69-6.22,3.15-7.76.27-.92-12.27,1.23-25.72.03-37.85-.09-.96-.08-2.49-1.32-2.91-.16-.05-.42.03-.65,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M113.09,100.92l.62,79.13,1.31,1.84-.68-2.9-.29-77.55c-.19-.34-.75-.37-.96-.53Z" />
                    <motion.path variants={draw} style={pathStyle} d="M208.18,170.7c.56-.14.55-.32,0-.53-2.15,3.41,1.76,11.07-3.4,12.92-3.8,1.36-6.01-1.19-6.33-4.11-.82-7.36,1.13-16.33.06-23.5-.22-1.46-.35-1.12-1.33-1.83,1.44.76.23,22.37.62,25.86.28,2.51,1.5,4.42,4.9,4.54,8.18.28,4.8-9.18,5.48-13.36Z" />
                    <motion.path variants={draw} style={pathStyle} d="M224.94,185.53v.53c11.24,3.06,22.58,6.99,32.74,12.79-8.87-7.32-21.93-10.16-32.74-13.32Z" />
                    <motion.path variants={draw} style={pathStyle} d="M11.54,125.95c12.87,10.42,22.83,10.5,38.16,16.52-8.74-4.7-17.22-5.5-25.88-9.31-4.26-1.88-8.62-4.84-12.28-7.2Z" />
                    <motion.path variants={draw} style={pathStyle} d="M84.63,167.51c2.86,2.2,5.74,3.57,9.7,4.26v7.72c0,.14,1.14,2.46,1.25,2.59.47.55,1.17.25,1.34.34-2.16-1.3-1.01-7.92-1.29-10.12,2.67.9,4.98,2.15,7.11,3.73-1.19-2.39-4.34-3.72-7.12-4.79-.29-.11-1,.11-1.29,0-3.2-1.25-6.62-2.27-9.7-3.73Z" />
                    <motion.path variants={draw} style={pathStyle} d="M260.85,213.23c-.46.15-.45.33,0,.53.12.01,2.31.58,2.11,1.06-1.76.62-3.53,1.25-5.29,1.88-.84.3-1.87-.11-1.57,1.32.18,0,.35,0,.53,0l7.73-3.58c1.83.14,3.67.65,5.47.91,1.4.2,2.82.42,4.22.53,1.21-.91-6.83-1.72-7.46-1.82-.69-.11-1.39-.82-1.52-.84-.41-1.3-1.82-1.3-4.22,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M94.98,101.98h.65c.29-.66.76-.94,1.6-1.06,4.54-.66,11.08.47,15.86,0-2.07-1.52-11.47-1.37-14.56-1.07-2.48.24-2.7.38-3.55,2.14Z" />
                    <motion.path variants={draw} style={pathStyle} d="M233.39,219.09c-.15-.47-.33-.46-.53,0,.47.71,1.06.92,1.87,1.04,3.92.57,11.31-.25,15.33-.99.91-.17,1.98.15,2.34-1.11-6.25.4-12.77,2.37-19.01,1.07Z" />
                    <motion.path variants={draw} style={pathStyle} d="M181.01,180.83c.03.24.34.48.65.53v-26.64c-.19-.4-.4-.39-.65,0,.72,8.39-.97,17.84,0,26.1Z" />
                    <motion.path variants={draw} style={pathStyle} d="M257.68,198.85c2.93,2.41,6.99,5.96,7.92,9.59-.07,1.29-.33,2.55-1.2,3.54l.67,1.26c4.62-3.63-.97-9.94-4.22-12.52-1.24-.99-1.99-1.19-3.17-1.86Z" />
                    <motion.path variants={draw} style={pathStyle} d="M181.01,154.72h.65c4.25-2.22,10.59-.57,15.52-1.07-.83-.61-1.01-.88-2.28-1.04-2.82-.35-13.09-.71-13.89,2.1Z" />
                    <motion.path variants={draw} style={pathStyle} d="M223.05,184.02l.65.53c.23-1.88.7-3.67.65-5.86-.18-2.83-.42-5.66-.73-8.5l-.56-.02c-.18,4.6.24,9.26,0,13.85Z" />
                    <motion.path variants={draw} style={pathStyle} d="M11.54,125.95c-3.67-2.98-6.86-6.45-10.99-9.06-.28,1,.67,1.27,1.29,1.87,1.49,1.45,6.05,5.44,7.75,6.43.77.45,1.8.66,1.96.76Z" />
                    <motion.path variants={draw} style={pathStyle} d="M127.97,119.03v.53c4.22.42,9.92-.58,13.92,0,.84.12,1.32.39,1.6,1.06h.65c-.41-.83.14-1.34-1.61-1.6-1.62-.24-13.13-.27-14.56,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M103.39,178.16c.3,1.53,1.2,3.04-.92,4.3-1.24.73-4.45.62-5.55-.04.33.18.26.85,1.6,1.06,3.21.5,5.63-.2,6.19-2.9.16-.74.59-2.84-1.33-2.41Z" />
                    <motion.path variants={draw} style={pathStyle} d="M208.18,170.17c-.07.12.03.34,0,.53,3.01-.44,12.41-1.2,14.88-.53,1.24.33.51,5.79.62,7.23.05.69.67,1.22.67,1.29-.34-1.7.73-8.06-.61-8.82-.68-.39-12.22-.39-13.99-.26-.8.06-1.15-.19-1.58.56Z" />
                    <motion.path variants={draw} style={pathStyle} d="M71.7,156.85c.11.12.19.82.61,1.34,1.28,1.58,4.73,3.65,6.5,5.06-1.11-2.61-4.78-4.51-7.11-6.39Z" />
                    <motion.path variants={draw} style={pathStyle} d="M49.7,142.47c2.83,1.52,5.67,3.84,9.06,4.79-2.2-2.52-5.88-3.54-9.06-4.79Z" />
                    <motion.path variants={draw} style={pathStyle} d="M242.9,212.7c-.46.15-.45.33,0,.53,3.21-.22,7.32-.15,10.56,0,.46-.15.45-.33,0-.53-3.38-.11-7.2-.16-10.56,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M253.46,212.7v.53c2.14.1,5.33.29,7.39.53v-.53c-1.22-.11-2.96-.49-3.7-.53-1.22-.07-2.47.04-3.7,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M65.87,152.06c1.93,1.69,3.82,3.18,5.82,4.79-.14-.15-.38-.97-.93-1.61-1.38-1.61-3.32-2.25-4.9-3.18Z" />
                    <motion.path variants={draw} style={pathStyle} d="M239.73,212.7c-1.03-.09-1.73.08-2.11.53-.46.15-.45.33,0,.53,1.11-.21,3.98-.44,5.28-.53v-.53c-1.04.05-2.14-.1-3.17,0Z" />
                    <motion.path variants={draw} style={pathStyle} d="M235.5,213.77c.7.28,1.58-.02,2.11-.53.63-.12,1.96-.52,2.11-.53-1.75.15-4.05-1.67-4.22,1.07Z" />
                    <motion.path variants={draw} style={pathStyle} d="M232.86,219.09h.53c-.67-1.95-1.01-3.22,1.06-4.26.64-.65.35-.7-.53-.53-1.78,1.06-2.27,2.98-1.06,4.79Z" />
                    <motion.path variants={draw} style={pathStyle} d="M65.87,152.06c-1.21-1.06-2.47-3.12-4.53-3.19.84,1.78,3.14,2.37,4.53,3.19Z" />
                    <motion.path variants={draw} style={pathStyle} d="M235.5,213.77c-.67.2-.73.03-1.58.53l.53.53c.56-.28,2.58-.95,3.17-1.07v-.53c-.7.13-1.43.33-2.11.53Z" />
                    <motion.path variants={draw} style={pathStyle} d="M84.63,167.51c-.55-.43-2.86-3.4-3.88-2.66.77,1.6,2.42,1.97,3.88,2.66Z" />
                    <motion.line variants={draw} style={pathStyle} x1="127.97" y1="86.73" x2="240.09" y2="140.32" />
                    <motion.line variants={draw} style={pathStyle} x1="237.01" y1="124.43" x2="240.09" y2="139.87" />
                    <motion.line variants={draw} style={pathStyle} x1="226.02" y1="143.95" x2="239.94" y2="140.46" />
                </motion.g>
            </g>
        </motion.svg>
    );
};
