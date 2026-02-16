"use client";

import { FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";

export function ImpactBadge({
  score,
  direction,
  size = "md",
}: {
  score: number;
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  size?: "sm" | "md";
}) {
  const directionConfig = {
    BULLISH: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      icon: FiArrowUp,
    },
    BEARISH: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: FiArrowDown,
    },
    NEUTRAL: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      icon: FiMinus,
    },
  };

  const config = directionConfig[direction];
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-1"
      : "px-2.5 py-1 text-sm gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-sm font-semibold ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      {score}/10
    </span>
  );
}

export function ImportanceDot({
  importance,
}: {
  importance: "HIGH" | "MEDIUM" | "LOW";
}) {
  const colors = {
    HIGH: "bg-red-500",
    MEDIUM: "bg-amber-500",
    LOW: "bg-[#6B7280]",
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[importance]}`}
      title={importance}
    />
  );
}
