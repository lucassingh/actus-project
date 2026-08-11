"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const DashboardScreen = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full p-4"
            >
                <Image
                    src="/screens/dashboard_screen.svg"
                    alt="Dashboard"
                    fill
                    className="object-contain"
                />
            </motion.div>
        </div>
    );
};
