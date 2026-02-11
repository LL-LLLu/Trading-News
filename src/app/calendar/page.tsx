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
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import Link from "next/link";

type CalendarEvent = {
  id: string;
  eventName: string;
  dateTime: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  actual: string | null;
};

export default function CalendarPage() {
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
    LOW: "bg-emerald-500 dark:bg-emerald-500",
  };

  return (
    <div className="min-h-screen">
      <Header title="Calendar" />
      <div className="px-4 md:px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <FiChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              Today
            </button>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {(["week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                    viewMode === mode
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-500 text-center uppercase tracking-wide"
              >
                {d}
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
              className="grid grid-cols-7 border-b last:border-b-0 border-gray-200 dark:border-gray-800"
            >
              {week.map((dayDate, di) => {
                const dayEvents = getEventsForDay(dayDate);
                const inMonth = isSameMonth(dayDate, currentMonth);
                const today = isToday(dayDate);

                return (
                  <div
                    key={di}
                    className={`min-h-[100px] md:min-h-[120px] p-2 border-r last:border-r-0 border-gray-200 dark:border-gray-800 ${
                      !inMonth ? "opacity-40" : ""
                    } ${today ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        today
                          ? "bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center"
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
                          +{dayEvents.length - 3} more
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
