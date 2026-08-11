import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    children,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "group/bento row-span-1 flex flex-col rounded-xl border border-neutral-200 transition duration-200 dark:border-white/[0.2] relative overflow-hidden p-10",
                className,
            )}
        >
            {children}
            <div className="flex flex-col h-full relative z-10">
                <div className="w-full">
                    {header}
                </div>
                <div className="mt-auto pt-8 transition duration-200 group-hover/bento:translate-x-1">
                    {icon && <div className="mb-2">{icon}</div>}
                    <div className="text-xl md:text-2xl font-bold text-white mb-2">
                        {title}
                    </div>
                    <div className="text-base text-white/90 leading-relaxed font-light">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
};
