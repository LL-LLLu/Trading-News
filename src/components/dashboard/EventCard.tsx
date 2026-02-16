"use client";

import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";
import { ImpactBadge, ImportanceDot } from "./ImpactBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

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

const categoryKeys: Record<string, TranslationKey> = {
  EMPLOYMENT: "cat.EMPLOYMENT",
  INFLATION: "cat.INFLATION",
  GDP: "cat.GDP",
  MANUFACTURING: "cat.MANUFACTURING",
  HOUSING: "cat.HOUSING",
  CONSUMER: "cat.CONSUMER",
  TRADE: "cat.TRADE",
  MONETARY_POLICY: "cat.MONETARY_POLICY",
  GOVERNMENT: "cat.GOVERNMENT",
  ENERGY: "cat.ENERGY",
  OTHER: "cat.OTHER",
};

export function EventCard({ event }: EventCardProps) {
  const { t, language } = useLanguage();
  const dateTime = new Date(event.dateTime);
  const isPast = dateTime < new Date();
  const dateFnsLocale = language === "zh" ? zhCN : undefined;
  const hasSurprise = !!(
    event.actual &&
    event.forecast &&
    event.actual !== event.forecast
  );

  return (
    <Link href={`/events/${event.id}`}>
      <div
        className={`bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none p-4 hover:bg-[#FAF7F2] dark:hover:bg-white/5 transition-colors`}
      >
        {/* Top row: name + badges */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ImportanceDot importance={event.importance} />
              <h3 className="font-serif font-semibold text-base text-[#1A1A1A] dark:text-[#F5F5F4] truncate">
                {event.eventName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span>{format(dateTime, "EEE, MMM d 'at' h:mm a", { locale: dateFnsLocale })}</span>
              {event.period && (
                <>
                  <span className="text-[#E5E0D8] dark:text-[#2D2D2D]">|</span>
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
            label={t("data.actual")}
            value={event.actual}
            highlight={hasSurprise}
          />
          <DataCell label={t("data.forecast")} value={event.forecast} />
          <DataCell label={t("data.previous")} value={event.previous} />
        </div>

        {/* Analysis summary */}
        {event.analysis && (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {event.analysis.summary}
          </p>
        )}

        {/* Category tag */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wide">
            {categoryKeys[event.category] ? t(categoryKeys[event.category]) : event.category}
          </span>
          {hasSurprise && (
            <Badge variant="info">{t("data.surprise")}</Badge>
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
      className={`rounded-none px-3 py-2 ${
        highlight
          ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
          : "bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-mono font-semibold ${
          value
            ? "text-[#1A1A1A] dark:text-[#F5F5F4]"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {value || "--"}
      </p>
    </div>
  );
}
