"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { FiSearch, FiFilter } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { WeekNavigator } from "@/components/dashboard/WeekNavigator";
import { EventList } from "@/components/dashboard/EventList";
import {
  QuickStatsSkeleton,
  EventCardSkeleton,
} from "@/components/ui/Skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  "ALL",
  "EMPLOYMENT",
  "INFLATION",
  "GDP",
  "MANUFACTURING",
  "HOUSING",
  "CONSUMER",
  "TRADE",
  "MONETARY_POLICY",
  "ENERGY",
];

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

export default function DashboardPage() {
  const { t } = useLanguage();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [direction, setDirection] = useState<string | null>(null);

  // 300ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Compute week boundaries in local timezone to avoid UTC mismatch
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const params = new URLSearchParams({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      });
      if (filter) params.set("importance", filter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);

      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [currentWeek, filter, debouncedSearch, category]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const highImpactEvents = events.filter((e) => e.importance === "HIGH");
  const now = new Date();
  const upcomingHighImpact = highImpactEvents.find(
    (e) => new Date(e.dateTime) > now,
  );

  const analyzedEvents = events.filter((e) => e.analysis);
  let weekSentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | null = null;
  if (analyzedEvents.length > 0) {
    const importanceWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
    let score = 0;
    for (const e of analyzedEvents) {
      if (!e.analysis) continue;
      const weight = importanceWeight[e.importance] * e.analysis.impactScore;
      if (e.analysis.impactDirection === "BULLISH") score += weight;
      else if (e.analysis.impactDirection === "BEARISH") score -= weight;
    }
    if (score > 0) weekSentiment = "BULLISH";
    else if (score < 0) weekSentiment = "BEARISH";
    else weekSentiment = "NEUTRAL";
  }

  // Apply direction filter client-side
  const filteredEvents = direction
    ? events.filter((e) => e.analysis?.impactDirection === direction)
    : events;

  return (
    <div className="min-h-screen">
      <Header titleKey="nav.dashboard" />
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Week Navigator */}
        <WeekNavigator
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
        />

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          {/* Row 1: Search input + importance filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-sm text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level === "ALL" ? null : level)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                    (level === "ALL" && !filter) || filter === level
                      ? "bg-[#0F4C81] text-white"
                      : "bg-white dark:bg-[#1A1A1A] text-[#6B7280] border border-[#E5E0D8] dark:border-[#2D2D2D] hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {t(
                    `filter.${level.toLowerCase()}` as
                      | "filter.all"
                      | "filter.high"
                      | "filter.medium"
                      | "filter.low",
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Category chips + direction chips */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
              <FiFilter className="text-gray-400 shrink-0" size={14} />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === "ALL" ? null : cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                    (cat === "ALL" && !category) || category === cat
                      ? "bg-[#0F4C81] text-white"
                      : "bg-white dark:bg-[#1A1A1A] text-[#6B7280] border border-[#E5E0D8] dark:border-[#2D2D2D] hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {cat === "ALL"
                    ? t("filter.all")
                    : t(
                        `cat.${cat}` as
                          | "cat.EMPLOYMENT"
                          | "cat.INFLATION"
                          | "cat.GDP"
                          | "cat.MANUFACTURING"
                          | "cat.HOUSING"
                          | "cat.CONSUMER"
                          | "cat.TRADE"
                          | "cat.MONETARY_POLICY"
                          | "cat.ENERGY",
                      )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(["BULLISH", "BEARISH", "NEUTRAL"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirection(direction === dir ? null : dir)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                    direction === dir
                      ? dir === "BULLISH"
                        ? "bg-green-600 text-white"
                        : dir === "BEARISH"
                          ? "bg-red-600 text-white"
                          : "bg-gray-500 text-white"
                      : "bg-white dark:bg-[#1A1A1A] text-[#6B7280] border border-[#E5E0D8] dark:border-[#2D2D2D] hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {t(
                    `search.${dir.toLowerCase()}` as
                      | "search.bullish"
                      | "search.bearish"
                      | "search.neutral",
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <QuickStatsSkeleton />
        ) : (
          <QuickStats
            totalEvents={filteredEvents.length}
            highImpactCount={
              filteredEvents.filter((e) => e.importance === "HIGH").length
            }
            weekSentiment={weekSentiment}
            nextEvent={upcomingHighImpact || null}
            currentWeek={currentWeek}
          />
        )}

        <CountdownTimer event={upcomingHighImpact || null} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <EventList events={filteredEvents} groupByDay />
        )}
      </div>
    </div>
  );
}
