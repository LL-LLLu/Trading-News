"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImpactBadge } from "@/components/dashboard/ImpactBadge";

interface SectorData {
  sector: string;
  avgScore: number;
  eventCount: number;
  netDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
  events: Array<{
    eventName: string;
    impactScore: number;
    impactDirection: string;
    summary: string;
  }>;
}

export function SectorsClient({ sectors }: { sectors: SectorData[] }) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const selected = sectors.find((s) => s.sector === selectedSector);

  function getHeatColor(score: number, direction: string): string {
    if (score === 0) return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    if (direction === "BULLISH") {
      if (score >= 7) return "bg-emerald-200 dark:bg-emerald-900/60 border-emerald-400 dark:border-emerald-700";
      if (score >= 4) return "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-800";
      return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50";
    }
    if (direction === "BEARISH") {
      if (score >= 7) return "bg-red-200 dark:bg-red-900/60 border-red-400 dark:border-red-700";
      if (score >= 4) return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800";
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";
    }
    return "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
  }

  return (
    <div className="min-h-screen">
      <Header title="Sector Heatmap" />
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sectors.map((sector) => (
            <button
              key={sector.sector}
              onClick={() =>
                setSelectedSector(
                  selectedSector === sector.sector ? null : sector.sector
                )
              }
              className={`border rounded-xl p-4 text-left transition-all hover:shadow-md ${getHeatColor(
                sector.avgScore,
                sector.netDirection
              )} ${
                selectedSector === sector.sector
                  ? "ring-2 ring-emerald-500"
                  : ""
              }`}
            >
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                {sector.sector}
              </h3>
              {sector.eventCount > 0 ? (
                <>
                  <ImpactBadge
                    score={sector.avgScore}
                    direction={sector.netDirection}
                    size="sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {sector.eventCount} event{sector.eventCount !== 1 ? "s" : ""}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  No data
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Sector Detail */}
        {selected && selected.events.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selected.sector}
                </h2>
                <ImpactBadge
                  score={selected.avgScore}
                  direction={selected.netDirection}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selected.events.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0"
                  >
                    <ImpactBadge
                      score={event.impactScore}
                      direction={
                        event.impactDirection as
                          | "BULLISH"
                          | "BEARISH"
                          | "NEUTRAL"
                      }
                      size="sm"
                    />
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {event.eventName}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {event.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/60" />
            <span>Strong Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-900/20" />
            <span>Mild Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-50 dark:bg-red-900/20" />
            <span>Mild Bearish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-900/60" />
            <span>Strong Bearish</span>
          </div>
        </div>
      </div>
    </div>
  );
}
