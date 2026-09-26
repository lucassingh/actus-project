// Shared dashboard primitives: one visual vocabulary for every screen.
// Hairline borders, 8px cards / 6px controls, no decorative shadows, Inter everywhere.
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Layout ──────────────────────────────────────────────────────────────────

// Fluid content: no max width, moderate side gutters. PageHeader bleeds over these gutters.
const GUTTER = "px-6 lg:px-8 2xl:px-12";

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full pb-10", GUTTER, className)}>{children}</div>;
}

/**
 * Navy jumbotron attached to the top bar, present on every screen. Bleeds to the edges of the
 * content area (negative margins undo Page's gutters) with a 20px radius on the bottom corners.
 */
export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  meta?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative isolate -mx-6 mb-8 overflow-hidden rounded-b-[20px] bg-primary lg:-mx-8 2xl:-mx-12",
        GUTTER
      )}
    >
      {/* Delicate depth: a soft lighter wash from the top-right, no hard shapes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(255,255,255,0.09),transparent_55%)]"
      />
      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {back && (
            <Link
              href={back.href}
              className="mb-1.5 inline-flex items-center gap-1.5 rounded text-[13px] text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden="true">&larr;</span>
              {back.label}
            </Link>
          )}
          {meta && <div className="mb-2 flex flex-wrap items-center gap-2">{meta}</div>}
          <h1 className="text-xl font-semibold tracking-[-0.015em] text-white">{title}</h1>
          {description && <p className="mt-0.5 max-w-[75ch] text-sm leading-relaxed text-white/75">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-line bg-white", className)}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-fg-subtle">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Settings-style footer strip at the bottom of a card (hint on the left, actions on the right). */
export function CardFooter({ hint, children }: { hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-b-lg border-t border-line bg-[#FAFAFB] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-fg-subtle">{hint}</p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ─── Stats: a grid of individual KPI cards ───────────────────────────────────

export function StatGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4", className)}>{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "brand",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  tone?: Tone;
}) {
  const t = TONES[tone];
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1.5 text-sm font-medium text-fg-muted">{label}</p>
        {Icon && (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", t.bg)}>
            <Icon className={cn("h-[18px] w-[18px]", t.text)} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-4xl font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">{value}</p>
      <div className="mt-3 flex min-h-5 items-center justify-between gap-3 text-xs text-fg-subtle">
        <span>{hint}</span>
        {href && (
          <span className="inline-flex items-center gap-1 font-medium text-fg-muted transition-transform duration-150 group-hover:translate-x-0.5">
            Ver <span aria-hidden="true">&rarr;</span>
          </span>
        )}
      </div>
    </>
  );
  const cls = "group block rounded-lg border border-line bg-white px-5 py-5";
  return href ? (
    <Link
      href={href}
      className={cn(
        cls,
        "transition-[border-color,box-shadow] duration-150 hover:border-[#D2D2DA] hover:shadow-[0_1px_2px_rgba(14,17,35,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// ─── Badges: dot + label, color carries state only ───────────────────────────

export type Tone = "neutral" | "brand" | "accent" | "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, { dot: string; text: string; bg: string }> = {
  neutral: { dot: "bg-[#9A9EB0]", text: "text-fg-muted", bg: "bg-[#F1F1F4]" },
  brand: { dot: "bg-primary", text: "text-primary", bg: "bg-[#EEF0F7]" },
  accent: { dot: "bg-accent", text: "text-[#B4400A]", bg: "bg-[#FDF1EA]" },
  info: { dot: "bg-[#3B6FD8]", text: "text-[#2A55B0]", bg: "bg-[#EEF3FD]" },
  success: { dot: "bg-[#1F9D57]", text: "text-[#17784A]", bg: "bg-[#EBF7F0]" },
  warning: { dot: "bg-[#D98A06]", text: "text-[#94600A]", bg: "bg-[#FDF5E6]" },
  danger: { dot: "bg-[#D93636]", text: "text-[#B42626]", bg: "bg-[#FDEEEE]" },
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium", t.bg, t.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} aria-hidden="true" />
      {children}
    </span>
  );
}

// ─── Feedback ────────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-[#FAFAFB]">
        <Icon className="h-5 w-5 text-fg-subtle" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-medium text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-fg-subtle">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Alert({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "success" | "danger" | "info";
  icon: LucideIcon;
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-[#BFE5CF] bg-[#F3FBF6] text-[#17603C]",
    danger: "border-[#F3C7C7] bg-[#FEF6F6] text-[#9B1F1F]",
    info: "border-line bg-white text-fg-muted",
  }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("mb-6 flex gap-3 rounded-lg border px-4 py-3 text-sm", styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? "mt-0.5" : undefined}>{children}</div>
      </div>
    </div>
  );
}

// ─── Controls ────────────────────────────────────────────────────────────────

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const buttonStyles = {
  /** Header CTA on the navy jumbotron. #C94B0B (not the brand #EA580E) keeps white text at 4.7:1. */
  hero: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#C94B0B] px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#B4420A] active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
  ),
  primary: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-light active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    focusRing
  ),
  secondary: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-medium text-fg transition-[background-color,transform] duration-150 hover:bg-[#FAFAFB] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    focusRing
  ),
  ghost: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-fg-muted transition-colors duration-150 hover:bg-[#F1F1F4] hover:text-fg",
    focusRing
  ),
  icon: cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-[#F1F1F4] hover:text-fg",
    focusRing
  ),
};

export const inputStyles =
  "h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-fg placeholder:text-[#8B90A4] transition-[border-color,box-shadow] duration-150 hover:border-[#D2D2DA] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/12";

export function Field({
  id,
  label,
  optional,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-fg">
        {label}
        {optional && <span className="ml-1 font-normal text-fg-subtle">(opcional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-fg-subtle">{hint}</p>}
    </div>
  );
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export const table = {
  wrap: "overflow-x-auto",
  table: "w-full min-w-[640px] text-sm",
  th: "border-b border-line bg-[#F2F2F5] px-5 py-2.5 text-left text-xs font-semibold text-fg-muted first:pl-5 whitespace-nowrap",
  tr: "border-b border-line-subtle last:border-0 transition-colors duration-150 hover:bg-[#FAFAFB]",
  td: "px-5 py-3 text-fg-muted",
};

/** Round for people; square (shape="square") for company logos. */
export function Avatar({
  name,
  src,
  size = 28,
  shape = "round",
}: {
  name: string;
  src?: string | null;
  size?: number;
  shape?: "round" | "square";
}) {
  const radius = shape === "square" ? "rounded-md" : "rounded-full";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className={cn("shrink-0 border border-line bg-white", radius, shape === "square" ? "object-contain p-0.5" : "object-cover")} style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center bg-[#EEF0F7] text-[11px] font-semibold text-primary", radius)}
      style={{ width: size, height: size }}
    >
      {initials || "?"}
    </span>
  );
}

export function formatDate(value: Date | string | null | undefined, withTime = false) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
}
