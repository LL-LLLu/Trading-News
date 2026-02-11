"use client";

import { format, isSameDay } from "date-fns";
import { EventCard } from "./EventCard";

type EventData = {
  id: string;
  eventName: string;
  dateTime: string;
  period?: string | null;
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
  importance: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  analysis?: {
    impactScore: number;
    impactDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
    summary: string;
  } | null;
};

interface EventListProps {
  events: EventData[];
  groupByDay?: boolean;
}

export function EventList({ events, groupByDay = true }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          No events found for this period.
        </p>
      </div>
    );
  }

  if (!groupByDay) {
    return (
      <div className="space-y-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  }

  // Group events by day
  const grouped: { date: Date; events: EventData[] }[] = [];
  for (const event of events) {
    const eventDate = new Date(event.dateTime);
    const existing = grouped.find((g) => isSameDay(g.date, eventDate));
    if (existing) {
      existing.events.push(event);
    } else {
      grouped.push({ date: eventDate, events: [event] });
    }
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.date.toISOString()}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {format(group.date, "EEEE, MMMM d")}
            </h3>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {group.events.length} event{group.events.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
