"use client";

import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface WeekNavigatorProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export function WeekNavigator({
  currentWeek,
  onWeekChange,
}: WeekNavigatorProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const isCurrentWeek =
    startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() ===
    weekStart.getTime();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onWeekChange(subWeeks(currentWeek, 1))}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      >
        <FiChevronLeft size={18} />
      </button>

      <div className="text-center min-w-[200px]">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </p>
        {isCurrentWeek && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Current Week
          </p>
        )}
      </div>

      <button
        onClick={() => onWeekChange(addWeeks(currentWeek, 1))}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      >
        <FiChevronRight size={18} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => onWeekChange(new Date())}
          className="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}
