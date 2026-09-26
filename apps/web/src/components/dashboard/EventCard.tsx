import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { EventSummary } from "@actus/types";
import { Badge, Avatar, formatDate } from "./ui";
import { EVENT_STATUS, EVENT_PRIORITY, EVENT_TYPE } from "./event-meta";

/** One event as a list row (used inside a Card). */
export function EventCard({ event }: { event: EventSummary }) {
  const status = EVENT_STATUS[event.status] ?? EVENT_STATUS.OPEN;
  const priority = EVENT_PRIORITY[event.priority] ?? EVENT_PRIORITY.MEDIUM;
  const creator = event.creator ? `${event.creator.name} ${event.creator.lastname}`.trim() : null;

  return (
    <li className="border-b border-line-subtle last:border-0">
      <Link
        href={`/dashboard/events/${event.id}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-[#FAFAFB] md:grid-cols-[minmax(0,1fr)_180px_110px_110px_16px]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-fg">{event.title}</p>
          <p className="mt-0.5 flex gap-x-3 truncate text-xs text-fg-subtle">
            <span>{EVENT_TYPE[event.eventType] ?? event.eventType}</span>
            {event.machineName && <span>{event.machineName}</span>}
            {event.location && <span className="hidden sm:inline">{event.location}</span>}
          </p>
        </div>

        <div className="hidden min-w-0 items-center gap-2 md:flex">
          {creator && (
            <>
              <Avatar name={creator} size={22} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] text-fg-muted">{creator}</p>
                <p className="text-xs text-fg-subtle">{formatDate(event.createdAt)}</p>
              </div>
            </>
          )}
        </div>

        <div className="hidden md:block">
          <Badge tone={priority.tone}>{priority.label}</Badge>
        </div>
        <div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <ChevronRight
          className="hidden h-4 w-4 text-[#B5B8C6] transition-transform duration-150 group-hover:translate-x-0.5 md:block"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
