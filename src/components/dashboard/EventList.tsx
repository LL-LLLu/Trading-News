"use client";

import { format, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, language } = useLanguage();
  const dateFnsLocale = language === "zh" ? zhCN : undefined;

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          {t("list.noEvents")}
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
            <h3 className="font-serif text-sm font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {format(group.date, "EEEE, MMMM d", { locale: dateFnsLocale })}
            </h3>
            <div className="flex-1 border-b-2 border-[#E5E0D8] dark:border-[#2D2D2D]" />
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {group.events.length} {group.events.length !== 1 ? t("list.events") : t("list.event")}
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
