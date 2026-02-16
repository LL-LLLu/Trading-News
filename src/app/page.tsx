"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        week: currentWeek.toISOString(),
      });
      if (filter) params.set("importance", filter);

      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [currentWeek, filter]);

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

  return (
    <div className="min-h-screen">
      <Header titleKey="nav.dashboard" />
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Week Navigator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <WeekNavigator
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
          />
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

        {loading ? (
          <QuickStatsSkeleton />
        ) : (
          <QuickStats
            totalEvents={events.length}
            highImpactCount={highImpactEvents.length}
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
          <EventList events={events} groupByDay />
        )}
      </div>
    </div>
  );
}
