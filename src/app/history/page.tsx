"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { EventList } from "@/components/dashboard/EventList";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import { FiSearch, FiFilter } from "react-icons/fi";
import { HistoricalChart } from "@/components/analysis/HistoricalChart";
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

export default function HistoryPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        mode: "all",
        limit: "500",
      });
      if (search) params.set("search", search);
      if (category) params.set("category", category);

      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const eventNames = [...new Set(events.map((e) => e.eventName))];
  const selectedEventData = selectedEvent
    ? events.filter((e) => e.eventName === selectedEvent)
    : [];

  return (
    <div className="min-h-screen">
      <Header titleKey="nav.history" />
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder={t("history.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-sm text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FiFilter className="text-gray-400 shrink-0" size={14} />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === "ALL" ? null : cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                  (cat === "ALL" && !category) || category === cat
                    ? "bg-[#0F4C81] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Historical Comparison */}
        {eventNames.length > 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none p-5">
            <h3 className="font-serif text-sm font-semibold text-[#1A1A1A] dark:text-[#F5F5F4] mb-3">
              {t("history.historicalComparison")}
            </h3>
            <select
              value={selectedEvent || ""}
              onChange={(e) => setSelectedEvent(e.target.value || null)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm text-gray-900 dark:text-white mb-4"
            >
              <option value="">{t("history.selectEvent")}</option>
              {eventNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {selectedEvent && selectedEventData.length > 0 && (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
                        <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-500 font-medium">
                          {t("data.date")}
                        </th>
                        <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-500 font-medium">
                          {t("data.period")}
                        </th>
                        <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-500 font-medium">
                          {t("data.actual")}
                        </th>
                        <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-500 font-medium">
                          {t("data.forecast")}
                        </th>
                        <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-500 font-medium">
                          {t("data.previous")}
                        </th>
                        <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-500 font-medium">
                          {t("data.surprise")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEventData.map((e) => {
                        const actualNum = e.actual
                          ? parseFloat(e.actual.replace(/[^0-9.-]/g, ""))
                          : null;
                        const forecastNum = e.forecast
                          ? parseFloat(e.forecast.replace(/[^0-9.-]/g, ""))
                          : null;
                        const surprise =
                          actualNum !== null && forecastNum !== null
                            ? (actualNum - forecastNum).toFixed(2)
                            : null;
                        return (
                          <tr
                            key={e.id}
                            className="border-b border-gray-100 dark:border-gray-800/50"
                          >
                            <td className="py-2 px-3 text-gray-900 dark:text-white">
                              {new Date(e.dateTime).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                              {e.period || "--"}
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                              {e.actual || "--"}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                              {e.forecast || "--"}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                              {e.previous || "--"}
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-medium ${
                                surprise
                                  ? parseFloat(surprise) > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : parseFloat(surprise) < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-gray-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {surprise
                                ? (parseFloat(surprise) > 0 ? "+" : "") +
                                  surprise
                                : "--"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <HistoricalChart events={selectedEventData} />
              </>
            )}
          </div>
        )}

        {/* Event list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <EventList events={events} groupByDay={false} />
        )}
      </div>
    </div>
  );
}
