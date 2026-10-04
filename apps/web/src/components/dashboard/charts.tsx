// Lightweight, dependency-free charts for the KPIs page. Pure presentational (server-safe,
// no client hooks). Magnitude is shown with single-hue bars and ALWAYS-VISIBLE direct labels
// — no data is hidden behind a hover — so each chart reads correctly for screen readers and
// in print. Colors come from the dashboard tokens, not a foreign palette.
import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  /** Optional bar color (hex). Defaults to the brand navy for single-hue magnitude. */
  color?: string;
  /** Optional secondary caption shown under the label (e.g. a percentage). */
  caption?: string;
}

const BRAND = "#2A2F52"; // primary-ish navy, legible as a filled mark on white

/** Horizontal magnitude bars: label on the left, proportional fill, value on the right.
 *  Best for ranked breakdowns (by machine, by priority). */
export function BreakdownBars({ data, ariaLabel }: { data: BarDatum[]; ariaLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="flex flex-col gap-3" aria-label={ariaLabel}>
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <li key={d.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate text-[13px] text-fg-muted" title={d.label}>
              {d.label}
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-fg">{d.value}</span>
            <div className="col-span-2 h-2 overflow-hidden rounded-full bg-[#F1F1F4]">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(pct, d.value > 0 ? 6 : 0)}%`, backgroundColor: d.color ?? BRAND }}
                aria-hidden="true"
              />
            </div>
            {d.caption && <span className="col-span-2 -mt-0.5 text-xs text-fg-subtle">{d.caption}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Vertical bars for a discrete time series (e.g. incidents per week). Value sits above each
 *  bar; period label below. A hairline baseline anchors the marks. */
export function TrendBars({ data, ariaLabel }: { data: BarDatum[]; ariaLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={ariaLabel} className="flex flex-col">
      <div className="flex h-40 items-end gap-2 border-b border-line">
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[11px] font-medium tabular-nums text-fg-muted">{d.value > 0 ? d.value : ""}</span>
              <div
                className={cn("w-full max-w-[40px] rounded-t-[4px]", d.value === 0 && "bg-[#F1F1F4]")}
                style={{
                  height: d.value > 0 ? `max(${pct}%, 4px)` : "4px",
                  backgroundColor: d.value > 0 ? d.color ?? BRAND : undefined,
                }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 pt-1.5">
        {data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[10px] text-fg-subtle">
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
