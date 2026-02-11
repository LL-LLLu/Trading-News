"use client";

import {
  FiCalendar,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

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
  const sentimentConfig = {
    BULLISH: { color: "text-emerald-600 dark:text-emerald-400", label: "Bullish" },
    BEARISH: { color: "text-red-600 dark:text-red-400", label: "Bearish" },
    NEUTRAL: { color: "text-gray-600 dark:text-gray-400", label: "Neutral" },
  };

  const sentiment = weekSentiment ? sentimentConfig[weekSentiment] : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={<FiCalendar size={18} />}
        label="Total Events"
        value={totalEvents.toString()}
        iconColor="text-blue-500"
      />
      <StatCard
        icon={<FiAlertTriangle size={18} />}
        label="High Impact"
        value={highImpactCount.toString()}
        iconColor="text-red-500"
      />
      <StatCard
        icon={<FiTrendingUp size={18} />}
        label="Week Sentiment"
        value={sentiment?.label || "Pending"}
        valueColor={sentiment?.color}
        iconColor="text-emerald-500"
      />
      <StatCard
        icon={<FiClock size={18} />}
        label="Next Event"
        value={
          nextEvent
            ? formatDistanceToNow(new Date(nextEvent.dateTime), {
                addSuffix: true,
              })
            : "None"
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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColor || "text-gray-500"}>{icon}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`text-xl font-bold ${
          valueColor || "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
