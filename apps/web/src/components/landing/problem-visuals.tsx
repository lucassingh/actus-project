"use client";
// Product-adapted animated illustrations for the Problem bento. One scene per pain point,
// built on a shared visual language (faint dotted guide ring, thin ink strokes, a single
// brand-accent accent, restrained motion). Everything settles to a legible static frame under
// prefers-reduced-motion (gated via useReducedMotion).
import { motion, useReducedMotion } from "motion/react";

// Shared faint dotted guide ring behind each scene (echoes the reference bento).
function GuideRing() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 260"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 text-ink-600"
      fill="none"
    >
      <circle cx="130" cy="130" r="118" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" opacity="0.5" />
      <circle cx="130" cy="130" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" opacity="0.35" />
    </svg>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-44 w-full items-center justify-center">
      <GuideRing />
      <div className="relative">{children}</div>
    </div>
  );
}

// 1 — Knowledge escaping: a "knowledge base" that leaks glowing dots upward until they vanish.
export function KnowledgeLossVisual() {
  const reduce = useReducedMotion();
  const dots = [
    { x: 78, y: 126 },
    { x: 92, y: 118 },
    { x: 106, y: 128 },
    { x: 120, y: 120 },
    { x: 86, y: 110 },
    { x: 114, y: 112 },
    { x: 100, y: 124 },
  ];
  return (
    <Stage>
      <svg viewBox="0 0 200 150" className="h-40 w-[220px]" fill="none">
        <rect x="62" y="92" width="76" height="50" rx="11" className="fill-ink-800 stroke-ink-600" strokeWidth="1.5" />
        <line x1="74" y1="106" x2="126" y2="106" className="stroke-ink-600" strokeWidth="2" strokeLinecap="round" />
        <line x1="74" y1="116" x2="112" y2="116" className="stroke-ink-600" strokeWidth="2" strokeLinecap="round" />
        {dots.map((d, i) => (
          <motion.circle
            key={i}
            cx={d.x}
            r="3"
            className="fill-accent"
            initial={{ cy: d.y, opacity: 0 }}
            animate={reduce ? { cy: d.y - 30, opacity: 0.35 } : { cy: [d.y, d.y - 78], opacity: [0, 1, 0] }}
            transition={reduce ? { duration: 0 } : { duration: 2.8, repeat: Infinity, delay: i * 0.38, ease: "easeOut" }}
          />
        ))}
      </svg>
    </Stage>
  );
}

// 2 — Dependency: a hub everyone relies on that flickers out, leaving the spokes dead.
export function DependencyVisual() {
  const reduce = useReducedMotion();
  const sats = [
    { x: 30, y: 30 },
    { x: 170, y: 26 },
    { x: 20, y: 110 },
    { x: 180, y: 112 },
    { x: 100, y: 136 },
  ];
  const center = { x: 100, y: 72 };
  const flicker = reduce
    ? {}
    : { opacity: [1, 1, 0.12, 1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.55, 0.65, 0.78, 1] } };
  return (
    <Stage>
      <svg viewBox="0 0 200 160" className="h-40 w-[220px]" fill="none">
        {/* Constant `initial`s: without them the first render comes from `animate`, which depends
            on useReducedMotion (null on the server) — a hydration mismatch under reduced motion. */}
        <motion.g initial={{ opacity: 1 }} animate={flicker}>
          {sats.map((s, i) => (
            <line key={i} x1={center.x} y1={center.y} x2={s.x} y2={s.y} className="stroke-accent/50" strokeWidth="1.5" />
          ))}
        </motion.g>
        {sats.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="7" className="fill-ink-800 stroke-ink-600" strokeWidth="1.5" />
        ))}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="13"
          className="fill-accent"
          initial={{ scale: 1 }}
          animate={reduce ? {} : { scale: [1, 1.12, 1] }}
          style={{ transformOrigin: `${center.x}px ${center.y}px` }}
          transition={reduce ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx={center.x} cy={center.y} r="13" className="fill-accent/30" initial={{ opacity: 1 }} animate={flicker} />
      </svg>
    </Stage>
  );
}

// 3 — No standard: three divergent routes drawn between the same two points.
export function StandardizationVisual() {
  const reduce = useReducedMotion();
  const paths = [
    { d: "M28 80 C 70 24, 118 40, 172 80", cls: "stroke-accent" },
    { d: "M28 80 C 66 116, 120 132, 172 80", cls: "stroke-ink-400" },
    { d: "M28 80 C 84 60, 96 104, 172 80", cls: "stroke-ink-300/70" },
  ];
  return (
    <Stage>
      <svg viewBox="0 0 200 160" className="h-40 w-[220px]" fill="none">
        {paths.map((p, i) => (
          <motion.path
            key={i}
            d={p.d}
            className={p.cls}
            strokeWidth="2"
            strokeLinecap="round"
            // Same initial on server and client (useReducedMotion is null on the server): reduced
            // motion just jumps to the end with duration 0.
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, delay: i * 0.5, repeat: Infinity, repeatDelay: 1.2, repeatType: "reverse" }}
          />
        ))}
        <circle cx="28" cy="80" r="6" className="fill-accent" />
        <circle cx="172" cy="80" r="6" className="fill-ink-700 stroke-ink-500" strokeWidth="1.5" />
      </svg>
    </Stage>
  );
}

// 4 — No visibility: a dashboard where most bars are empty outlines; a scan line finds no data.
export function VisibilityVisual() {
  const reduce = useReducedMotion();
  const bars = [
    { x: 36, filled: 0.35 },
    { x: 62, filled: 0 },
    { x: 88, filled: 0 },
    { x: 114, filled: 0.22 },
    { x: 140, filled: 0 },
    { x: 166, filled: 0 },
  ];
  const base = 118;
  const maxH = 70;
  return (
    <Stage>
      <svg viewBox="0 0 220 150" className="h-40 w-[240px]" fill="none">
        <line x1="26" y1={base} x2="200" y2={base} className="stroke-ink-600" strokeWidth="1.5" />
        {bars.map((b, i) => {
          const h = Math.max(b.filled * maxH, 8);
          const y = base - h;
          return b.filled > 0 ? (
            <rect key={i} x={b.x} y={y} width="14" height={h} rx="3" className="fill-accent/70" />
          ) : (
            <rect key={i} x={b.x} y={base - maxH} width="14" height={maxH} rx="3" className="fill-none stroke-ink-600" strokeWidth="1.3" strokeDasharray="3 4" />
          );
        })}
        {/* Scanner line. Hidden with CSS under reduced motion, not with a JS branch: the server
            can't know the preference, and rendering it on one side only is a hydration mismatch. */}
        <motion.line
          y1={base - maxH - 6}
          y2={base + 4}
          className="stroke-accent/60 motion-reduce:hidden"
          strokeWidth="1.5"
          // Without a starting value Motion writes x1/x2="undefined" on the first frame (console error).
          initial={{ x1: 30, x2: 30 }}
          animate={reduce ? undefined : { x1: [30, 196, 30], x2: [30, 196, 30] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </Stage>
  );
}
