"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

const ReadyContext = createContext(true);

/** True once the loader is leaving: entrance animations wait for it instead of playing hidden under it. */
export function useSiteReady() {
  return useContext(ReadyContext);
}

// Isotipo paths from public/logos/isologo-light.svg (viewBox 0 0 118 118).
const A_PATH =
  "M108.93 79.12C91.4099 67.78 72.2999 74.82 56.6699 86.58C48.8499 92.46 26.8299 115.19 19.8499 116.44C4.5099 119.2 -4.5701 104.13 2.3599 88.98C13.9199 63.68 29.1299 36.82 41.9999 10.6C47.8799 -1.93 64.3699 -3.2 71.9599 5.99L108.93 79.12Z";
const SWOOSH_PATH =
  "M61.27 90.1C73.61 79.1 89.17 75.09 104.06 81.89C115.36 87.05 121.56 97.16 113.26 109.84C98.34 132.64 75.69 94.68 61.27 90.1Z";
const VIEWBOX = 118;

const NAVY = "#242F5B";
const INK_950 = "#0A0D1A"; // Hero background: the dive ends on it, so the reveal has no seam.

/** Point inside the A that the dive zooms into, and the radius around it that stays inside the shape. */
const ORIGIN = { x: 48, y: 56 };
const INNER_R = 24;

/** Length of the CSS intro (draw, fill, leaf settle and counter, see .site-loader in globals.css).
 *  Only a fallback: the loader waits for those animations to actually finish. */
const INTRO_MS = 1450;
/** Beat with the finished logo on screen before diving, so it reads as the logo. */
const HOLD_MS = 200;
const DIVE_MS = 850;
const REVEAL_MS = 450;
/** Fonts in before revealing so the hero doesn't reflow, but never wait longer than this. */
const FONT_WAIT_MS = 2500;

type Phase = "intro" | "dive" | "reveal" | "done";

/** Survives client-side navigations (back to "/" from another page doesn't replay it); resets on a full load. */
let played = false;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves when the CSS intro inside `root` is over (it started at the first paint, before
 *  hydration, so there may be little or nothing left). Capped in case it never runs. */
function introFinished(root: HTMLElement | null) {
  const animations = (root?.getAnimations?.({ subtree: true }) ?? []).filter(
    (a) =>
      "animationName" in a &&
      (a as CSSAnimation).animationName.startsWith("site-loader-") &&
      (a as CSSAnimation).animationName !== "site-loader-failsafe",
  );
  if (animations.length === 0) return wait(INTRO_MS);
  const done = Promise.all(animations.map((a) => a.finished.catch(() => undefined)));
  return Promise.race([done, wait(INTRO_MS + 1500)]);
}

/**
 * Entrance loader for the landing. The intro is pure CSS so it runs from the first paint, before
 * hydration: the isotipo is drawn as an outline (the A, then the orange leaf), fills in, and a
 * counter goes to 100%. Then the leaf drops away and the A grows from inside until it covers the
 * screen while its navy darkens to the hero's ink ("dive"), and the overlay fades out ("reveal")
 * onto a hero of that same color, which only then plays its own entrance.
 *
 * No JS: a <noscript> style hides it, and a CSS failsafe hides it after a few seconds anyway.
 * prefers-reduced-motion: it never shows (CSS) and the page is ready right away.
 */
export function SiteLoaderProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(() => (played ? "done" : "intro"));
  const [diveScale, setDiveScale] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (phase !== "intro") return;
    let cancelled = false;
    // Read here, not with useReducedMotion: the first render must match the server's (overlay
    // included; CSS keeps it hidden under reduced motion), and the effect only reacts afterwards.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fonts = Promise.race([document.fonts.ready, wait(FONT_WAIT_MS)]);
    const introOver = reduce
      ? Promise.resolve()
      : Promise.all([introFinished(overlayRef.current), fonts]).then(() => wait(HOLD_MS));
    introOver.then(() => {
      if (cancelled) return;
      played = true;
      if (reduce) {
        setPhase("done");
        return;
      }
      // Scale that grows the circle of INNER_R around ORIGIN past the farthest screen corner.
      const rect = markRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const unit = rect.width / VIEWBOX;
        const ox = rect.left + ORIGIN.x * unit;
        const oy = rect.top + ORIGIN.y * unit;
        const far = Math.hypot(Math.max(ox, window.innerWidth - ox), Math.max(oy, window.innerHeight - oy));
        setDiveScale((far / (INNER_R * unit)) * 1.1);
      }
      setPhase("dive");
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "dive") {
      const t = setTimeout(() => setPhase("reveal"), DIVE_MS);
      return () => clearTimeout(t);
    }
    if (phase === "reveal") {
      const t = setTimeout(() => setPhase("done"), REVEAL_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // The hero starts entering as the overlay fades, so it appears while the ink clears, not after.
  const ready = phase === "reveal" || phase === "done";
  const intro = phase === "intro";

  return (
    <ReadyContext.Provider value={ready}>
      {phase !== "done" && (
        <motion.div
          ref={overlayRef}
          aria-hidden="true"
          className="site-loader fixed inset-0 z-(--z-loader) grid place-items-center overflow-hidden bg-canvas"
          initial={false}
          animate={{ opacity: phase === "reveal" ? 0 : 1 }}
          transition={{ duration: REVEAL_MS / 1000, ease: "easeOut" }}
          style={{ pointerEvents: phase === "reveal" ? "none" : "auto" }}
        >
          <noscript>
            <style>{".site-loader{display:none!important}"}</style>
          </noscript>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative size-[clamp(72px,9vw,104px)] shrink-0">
              <motion.svg
                ref={markRef}
                viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
                className="absolute inset-0 size-full overflow-visible"
                style={{ transformOrigin: `${(ORIGIN.x / VIEWBOX) * 100}% ${(ORIGIN.y / VIEWBOX) * 100}%` }}
                initial={false}
                animate={{ scale: intro ? 1 : diveScale }}
                transition={{ duration: DIVE_MS / 1000, ease: [0.7, 0, 0.84, 0] }}
              >
                <motion.path
                  d={A_PATH}
                  pathLength={1}
                  className="site-loader-a"
                  initial={false}
                  animate={{ fill: intro ? NAVY : INK_950, stroke: intro ? NAVY : INK_950 }}
                  transition={{ duration: (DIVE_MS / 1000) * 0.6, ease: "easeIn" }}
                />
              </motion.svg>
              <motion.svg
                viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
                className="absolute inset-0 size-full overflow-visible"
                initial={false}
                animate={intro ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <path d={SWOOSH_PATH} pathLength={1} className="site-loader-swoosh" />
              </motion.svg>
            </div>
            <p
              className={`flex items-baseline gap-2 font-heading text-xs font-semibold uppercase tracking-[0.2em] text-fg transition-opacity duration-200 sm:text-sm ${
                intro ? "" : "opacity-0"
              }`}
            >
              Cargando
              <span className="site-loader-pct min-w-[4ch] text-fg-subtle tabular-nums" />
            </p>
          </div>
        </motion.div>
      )}
      {children}
    </ReadyContext.Provider>
  );
}
