'use client';
// Adapted from React Bits (SpotlightCard, TS + Tailwind). Changes: spotlight is pointer-driven
// and simply fades out when the pointer leaves (no effect on touch / without hover, and nothing
// animated under prefers-reduced-motion — the card is fully legible static); colours default to
// the Actus accent token and the card chrome uses the ink-* scale.
import React, { useRef, type ReactNode } from 'react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /** rgba/hex (with alpha) of the spotlight glow */
  spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(234, 88, 14, 0.16)', // --accent @ low alpha
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    el.style.setProperty('--spotlight-opacity', '1');
  };

  const handleLeave = () => {
    ref.current?.style.setProperty('--spotlight-opacity', '0');
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ '--spotlight-opacity': 0 } as React.CSSProperties}
      className={`relative overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/60 transition-colors duration-500 hover:border-ink-600 ${className}`}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: 'var(--spotlight-opacity)' as unknown as number,
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

export default SpotlightCard;
