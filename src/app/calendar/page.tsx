"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

type CalendarEvent = {
  id: string;
  eventName: string;
  dateTime: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  actual: string | null;
};

const dayKeys: TranslationKey[] = [
  "cal.mon",
  "cal.tue",
  "cal.wed",
  "cal.thu",
  "cal.fri",
  "cal.sat",
  "cal.sun",
];

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const dateFnsLocale = language === "zh" ? zhCN : undefined;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const fetchEvents = useCallback(async () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    try {
      const params = new URLSearchParams({
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
        includeAnalysis: "false",
        limit: "500",
      });
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  function getEventsForDay(date: Date) {
    return events.filter((e) => isSameDay(new Date(e.dateTime), date));
  }

  const importanceColor: Record<string, string> = {
    HIGH: "bg-red-500 dark:bg-red-500",
    MEDIUM: "bg-amber-500 dark:bg-amber-500",
    LOW: "bg-[#6B7280] dark:bg-[#6B7280]",
  };

  return (
    <div className="min-h-screen">
      <Header titleKey="nav.calendar" />
      <div className="px-4 md:px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <FiChevronLeft size={18} />
            </button>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4] min-w-[180px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: dateFnsLocale })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 text-xs font-medium text-[#0F4C81] dark:text-[#5BA3D9] bg-transparent border border-[#0F4C81] dark:border-[#5BA3D9] rounded-sm hover:bg-[#0F4C81]/10 dark:hover:bg-[#5BA3D9]/10 transition-colors"
            >
              {t("week.today")}
            </button>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-sm p-0.5">
              {(["week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                    viewMode === mode
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t(`cal.${mode}` as "cal.week" | "cal.month")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
            {dayKeys.map((key) => (
              <div
                key={key}
                className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-500 text-center uppercase tracking-wide"
              >
                {t(key)}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {(viewMode === "week"
            ? [weeks.find((w) => w.some((d) => isToday(d))) || weeks[0]]
            : weeks
          ).map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b last:border-b-0 border-[#E5E0D8] dark:border-[#2D2D2D]"
            >
              {week.map((dayDate, di) => {
                const dayEvents = getEventsForDay(dayDate);
                const inMonth = isSameMonth(dayDate, currentMonth);
                const today = isToday(dayDate);

                return (
                  <div
                    key={di}
                    className={`min-h-[100px] md:min-h-[120px] p-2 border-r last:border-r-0 border-[#E5E0D8] dark:border-[#2D2D2D] ${
                      !inMonth ? "opacity-40" : ""
                    } ${today ? "bg-[#0F4C81]/5 dark:bg-[#5BA3D9]/5" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        today
                          ? "bg-[#0F4C81] text-white w-6 h-6 rounded-full inline-flex items-center justify-center"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {format(dayDate, "d")}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <Link key={ev.id} href={`/events/${ev.id}`}>
                          <div
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium ${importanceColor[ev.importance]}`}
                          >
                            {ev.eventName}
                          </div>
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-500 pl-1.5">
                          +{dayEvents.length - 3} {t("cal.more")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
