import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCw, Lock, Share, Plus, Copy } from "lucide-react";
import Image from "next/image";

interface SafariProps extends React.HTMLAttributes<HTMLDivElement> {
    url?: string;
    imageSrc?: string;
    videoSrc?: string;
    width?: number;
    height?: number;
}

export function Safari({
    url = "actus.ai",
    imageSrc,
    videoSrc,
    width,
    height,
    className,
    children,
    ...props
}: SafariProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col w-full overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-white dark:bg-neutral-900",
                className
            )}
            style={{
                maxWidth: width,
            }}
            {...props}
        >
            {/* Chrome Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200 bg-[#f8f9fa] px-4 dark:border-neutral-800 dark:bg-neutral-900">

                {/* Left: Window Controls & Navigation */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Window Controls */}
                    <div className="flex gap-2">
                        <div className="size-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                        <div className="size-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]" />
                        <div className="size-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex gap-2 text-neutral-500">
                        <ChevronLeft className="size-4 opacity-50" />
                        <ChevronRight className="size-4 opacity-50" />
                    </div>
                </div>

                {/* Center: Address Bar */}
                <div className="flex-1 shrink flex justify-center max-w-[500px] px-2">
                    <div className="flex items-center justify-center gap-2 w-full max-w-md rounded-md bg-white border border-neutral-200/60 shadow-sm py-1.5 px-3 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 relative group transition-all hover:border-neutral-300">
                        <Lock className="size-3 text-neutral-500" />
                        <span>{url}</span>
                        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <RotateCw className="size-3 text-neutral-400" />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-1 justify-end items-center gap-3 text-neutral-500">
                    <Share className="size-4 hover:text-neutral-700 transition-colors cursor-default" />
                    <Plus className="size-4 hover:text-neutral-700 transition-colors cursor-default" />
                    <Copy className="size-4 hover:text-neutral-700 transition-colors cursor-default" />
                </div>

            </div>

            {/* Viewport Content */}
            <div
                className="relative flex-1 w-full bg-white overflow-hidden"
            >
                {videoSrc ? (
                    <video
                        className="absolute inset-0 h-full w-full object-cover"
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : imageSrc ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={imageSrc}
                            alt="Safari Content"
                            fill
                            className="object-cover object-top"
                        />
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
