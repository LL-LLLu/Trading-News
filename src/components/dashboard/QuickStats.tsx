"use client";

import {
  FiCalendar,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickStatsProps {
  totalEvents: number;
  highImpactCount: number;
  weekSentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  nextEvent: {
    eventName: string;
    dateTime: string;
  } | null;
}

export function QuickStats({
  totalEvents,
  highImpactCount,
  weekSentiment,
  nextEvent,
}: QuickStatsProps) {
  const { t, language } = useLanguage();

  const sentimentConfig = {
    BULLISH: { color: "text-green-600 dark:text-green-400", labelKey: "stats.bullish" as const },
    BEARISH: { color: "text-red-600 dark:text-red-400", labelKey: "stats.bearish" as const },
    NEUTRAL: { color: "text-gray-600 dark:text-gray-400", labelKey: "stats.neutral" as const },
  };

  const sentiment = weekSentiment ? sentimentConfig[weekSentiment] : null;
  const dateFnsLocale = language === "zh" ? { locale: zhCN } : undefined;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={<FiCalendar size={18} />}
        label={t("stats.totalEvents")}
        value={totalEvents.toString()}
        iconColor="text-[#0F4C81]"
      />
      <StatCard
        icon={<FiAlertTriangle size={18} />}
        label={t("stats.highImpact")}
        value={highImpactCount.toString()}
        iconColor="text-red-500"
      />
      <StatCard
        icon={<FiTrendingUp size={18} />}
        label={t("stats.weekSentiment")}
        value={sentiment ? t(sentiment.labelKey) : t("stats.pending")}
        valueColor={sentiment?.color}
        iconColor="text-green-600"
      />
      <StatCard
        icon={<FiClock size={18} />}
        label={t("stats.nextEvent")}
        value={
          nextEvent
            ? formatDistanceToNow(new Date(nextEvent.dateTime), {
                addSuffix: true,
                ...dateFnsLocale,
              })
            : t("stats.none")
        }
        subtitle={nextEvent?.eventName}
        iconColor="text-amber-500"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  valueColor,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none border-t-2 border-t-[#0F4C81] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColor || "text-[#6B7280]"}>{icon}</span>
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`font-serif text-xl font-bold ${
          valueColor || "text-[#1A1A1A] dark:text-[#F5F5F4]"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[#6B7280] truncate mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
