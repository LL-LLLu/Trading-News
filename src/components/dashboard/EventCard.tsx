"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { ImpactBadge, ImportanceDot } from "./ImpactBadge";

interface EventCardProps {
  event: {
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
}

const categoryLabels: Record<string, string> = {
  EMPLOYMENT: "Employment",
  INFLATION: "Inflation",
  GDP: "GDP",
  MANUFACTURING: "Manufacturing",
  HOUSING: "Housing",
  CONSUMER: "Consumer",
  TRADE: "Trade",
  MONETARY_POLICY: "Monetary Policy",
  GOVERNMENT: "Government",
  ENERGY: "Energy",
  OTHER: "Other",
};

export function EventCard({ event }: EventCardProps) {
  const dateTime = new Date(event.dateTime);
  const isPast = dateTime < new Date();
  const hasSurprise = !!(
    event.actual &&
    event.forecast &&
    event.actual !== event.forecast
  );

  return (
    <Link href={`/events/${event.id}`}>
      <div
        className={`bg-white dark:bg-gray-900 border rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:shadow-md ${
          isPast
            ? "border-gray-200 dark:border-gray-800"
            : "border-gray-200 dark:border-gray-800 ring-1 ring-transparent hover:ring-emerald-500/20"
        }`}
      >
        {/* Top row: name + badges */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ImportanceDot importance={event.importance} />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {event.eventName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <span>{format(dateTime, "EEE, MMM d 'at' h:mm a")}</span>
              {event.period && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <span>{event.period}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={
                event.importance === "HIGH"
                  ? "danger"
                  : event.importance === "MEDIUM"
                    ? "warning"
                    : "neutral"
              }
            >
              {event.importance}
            </Badge>
            {event.analysis && (
              <ImpactBadge
                score={event.analysis.impactScore}
                direction={event.analysis.impactDirection}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Data row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <DataCell
            label="Actual"
            value={event.actual}
            highlight={hasSurprise}
          />
          <DataCell label="Forecast" value={event.forecast} />
          <DataCell label="Previous" value={event.previous} />
        </div>

        {/* Analysis summary */}
        {event.analysis && (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {event.analysis.summary}
          </p>
        )}

        {/* Category tag */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wide">
            {categoryLabels[event.category] || event.category}
          </span>
          {hasSurprise && (
            <Badge variant="info">Surprise</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function DataCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2 ${
        highlight
          ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
          : "bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-semibold ${
          value
            ? "text-gray-900 dark:text-white"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {value || "--"}
      </p>
    </div>
  );
}
