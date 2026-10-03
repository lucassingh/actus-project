"use client";
// Adapted from React Bits / magicui (AnimatedList, TS + Tailwind). Items reveal one by one with a
// spring, newest at the bottom (chat-feed order), windowed to `max` so older items exit from the
// top; the sequence loops. Under prefers-reduced-motion the full list is shown statically.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Children, useEffect, useState, type ReactNode } from "react";

export interface AnimatedListProps {
  children: ReactNode;
  /** ms between each item appearing */
  delay?: number;
  /** max items visible at once */
  max?: number;
  className?: string;
}

export function AnimatedList({ children, delay = 1900, max = 4, className = "" }: AnimatedListProps) {
  const items = Children.toArray(children);
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? items.length : 1);

  useEffect(() => {
    if (reduce) return;
    const atEnd = count >= items.length;
    const t = setTimeout(() => setCount(atEnd ? 1 : count + 1), atEnd ? delay * 2.2 : delay);
    return () => clearTimeout(t);
  }, [count, items.length, delay, reduce]);

  const start = reduce ? 0 : Math.max(0, count - max);
  const end = reduce ? items.length : count;
  const visible = items.slice(start, end);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <AnimatePresence initial={false} mode="popLayout">
        {visible.map((item) => (
          <motion.div
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            key={(item as any).key}
            layout
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedList;
