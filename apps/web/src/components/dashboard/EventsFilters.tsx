"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_STATUS, EVENT_PRIORITY, EVENT_TYPE } from "./event-meta";

const FILTERS = [
  { key: "status", label: "Estado", all: "Todos los estados", options: Object.entries(EVENT_STATUS).map(([v, m]) => [v, m.label]) },
  { key: "priority", label: "Prioridad", all: "Todas las prioridades", options: Object.entries(EVENT_PRIORITY).map(([v, m]) => [v, m.label]) },
  { key: "eventType", label: "Tipo", all: "Todos los tipos", options: Object.entries(EVENT_TYPE) },
] as const;

const selectStyles =
  "h-8 rounded-md border border-line bg-white pl-2.5 pr-8 text-[13px] text-fg transition-colors duration-150 hover:border-[#D2D2DA] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/12";

export function EventsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filters apply on change; any change resets pagination.
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const hasActive = FILTERS.some((f) => searchParams.get(f.key));

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 transition-opacity", isPending && "opacity-60")}>
      {FILTERS.map((f) => (
        <label key={f.key} className="relative">
          <span className="sr-only">{f.label}</span>
          <select
            value={searchParams.get(f.key) ?? ""}
            onChange={(e) => update(f.key, e.target.value)}
            className={selectStyles}
          >
            <option value="">{f.all}</option>
            {f.options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {hasActive && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(pathname))}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-fg-muted transition-colors duration-150 hover:bg-[#F1F1F4] hover:text-fg"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
