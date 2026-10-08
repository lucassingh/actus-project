"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { projects } from "@/data/mockData";

// The desktop stack ends with the overview on top; on a phone most people only see the first
// slide, so the carousel starts with it.
const slides = [...projects].reverse();

/**
 * Mobile replacement for the CardParallax stack: a 100vh sticky scroll doesn't work on a phone
 * (tiny screenshots, screen-tall gaps). Native swipe with scroll-snap, a caption per screen,
 * and dots that follow the scroll position.
 */
export function DashboardCarousel() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    // The last slide can't snap to the start (no room after it): at the end, it's the active one.
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    const index = atEnd ? slides.length - 1 : Math.round(track.scrollLeft / step);
    setActive(Math.min(slides.length - 1, Math.max(0, index)));
  };

  const goTo = (index: number) => {
    const slide = trackRef.current?.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "start" });
  };

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Pantallas del panel del supervisor"
      className="pt-10 pb-20"
    >
      <ul
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Deslice para ver las pantallas"
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {slides.map((slide, i) => (
          <motion.li
            key={slide.title}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${slides.length}: ${slide.title}`}
            // Same `initial` on server and client (useReducedMotion is null on the server).
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, delay: Math.min(i, 1) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="w-[86%] max-w-105 shrink-0 snap-start"
          >
            <figure>
              <div className="overflow-hidden rounded-xl bg-white p-1 shadow-[0_18px_40px_-20px_rgba(14,17,35,0.35)] ring-1 ring-line">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  sizes="86vw"
                  className="block h-auto w-full rounded-lg"
                />
              </div>
              <figcaption className="mt-4 pr-2">
                <p className="font-heading text-lg font-bold leading-snug text-fg">{slide.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{slide.description}</p>
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-1">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ver ${slide.title}`}
            aria-current={i === active}
            className="group grid h-11 w-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-accent" : "w-2 bg-fg-subtle/40 group-hover:bg-fg-subtle/70"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
