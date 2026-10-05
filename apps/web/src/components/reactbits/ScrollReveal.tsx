'use client';
// Adapted from React Bits (ScrollReveal, TS + Tailwind). Changes: full sentence stays in the
// DOM as real words (screen readers read the phrase, not word-by-word); no animation under
// prefers-reduced-motion (text renders fully visible, no rotation/blur); optional brand-accent
// highlight for key words; colours come from Actus tokens via the className props.
import React, { useMemo, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  /** words (case/punctuation-insensitive) that get the accent highlight */
  highlightWords?: string[];
  highlightClassName?: string;
}

const normalize = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.12,
  baseRotation = 2,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  highlightWords = [],
  highlightClassName = 'text-accent',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightSet = useMemo(
    () => new Set(highlightWords.map(normalize)),
    [highlightWords]
  );

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      const isHighlight = highlightSet.has(normalize(word));
      return (
        <span
          className={`word inline-block${isHighlight ? ` ${highlightClassName}` : ''}`}
          key={index}
        >
          {word}
        </span>
      );
    });
  }, [children, highlightSet, highlightClassName]);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const words = el.querySelectorAll<HTMLElement>('.word');

      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        gsap.set(el, { rotate: 0 });
        gsap.set(words, { opacity: 1, filter: 'blur(0px)' });
        return;
      }

      const scroller = scrollContainerRef?.current ?? undefined;

      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          rotate: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, scroller, start: 'top bottom', end: rotationEnd, scrub: true },
        }
      );

      gsap.fromTo(
        words,
        { opacity: baseOpacity, willChange: 'opacity, filter' },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: { trigger: el, scroller, start: 'top bottom-=15%', end: wordAnimationEnd, scrub: true },
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          words,
          { filter: `blur(${blurStrength}px)` },
          {
            filter: 'blur(0px)',
            ease: 'none',
            stagger: 0.05,
            scrollTrigger: { trigger: el, scroller, start: 'top bottom-=15%', end: wordAnimationEnd, scrub: true },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [enableBlur, baseRotation, baseOpacity, blurStrength] }
  );

  return (
    <div ref={containerRef} className={containerClassName}>
      <p className={textClassName}>{splitText}</p>
    </div>
  );
};

export default ScrollReveal;
