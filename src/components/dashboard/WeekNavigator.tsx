"use client";

import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { zhCN } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeekNavigatorProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export function WeekNavigator({
  currentWeek,
  onWeekChange,
}: WeekNavigatorProps) {
  const { t, language } = useLanguage();
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const dateFnsLocale = language === "zh" ? zhCN : undefined;

  const isCurrentWeek =
    startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() ===
    weekStart.getTime();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onWeekChange(subWeeks(currentWeek, 1))}
        className="p-2 rounded-sm hover:bg-white dark:hover:bg-white/5 transition-colors text-[#6B7280]"
      >
        <FiChevronLeft size={18} />
      </button>

      <div className="text-center min-w-[200px]">
        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
          {format(weekStart, "MMM d", { locale: dateFnsLocale })} -{" "}
          {format(weekEnd, "MMM d, yyyy", { locale: dateFnsLocale })}
        </p>
        {isCurrentWeek && (
          <p className="text-xs text-[#0F4C81] dark:text-[#5BA3D9] font-medium">
            {t("week.currentWeek")}
          </p>
        )}
      </div>

      <button
        onClick={() => onWeekChange(addWeeks(currentWeek, 1))}
        className="p-2 rounded-sm hover:bg-white dark:hover:bg-white/5 transition-colors text-[#6B7280]"
      >
        <FiChevronRight size={18} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => onWeekChange(new Date())}
          className="px-3 py-1.5 text-xs font-medium text-[#0F4C81] dark:text-[#5BA3D9] bg-transparent border border-[#0F4C81] dark:border-[#5BA3D9] rounded-sm hover:bg-[#0F4C81]/10 dark:hover:bg-[#5BA3D9]/10 transition-colors"
        >
          {t("week.today")}
        </button>
      )}
    </div>
  );
}
