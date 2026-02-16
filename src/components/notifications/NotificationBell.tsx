"use client";

import { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import {
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
  HiOutlineClock,
} from "react-icons/hi2";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "SURPRISE":
      return (
        <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <HiOutlineExclamationTriangle className="text-red-600 dark:text-red-400" size={14} />
        </div>
      );
    case "OUTLOOK":
      return (
        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <HiOutlineChartBar className="text-[#0F4C81] dark:text-[#5BA3D9]" size={14} />
        </div>
      );
    case "EVENT_COUNTDOWN":
      return (
        <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <HiOutlineClock className="text-amber-600 dark:text-amber-400" size={14} />
        </div>
      );
    default:
      return (
        <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
          <FiBell className="text-gray-500" size={14} />
        </div>
      );
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function handleOpen() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      markAllRead();
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-[#0F4C81] dark:hover:text-[#5BA3D9] transition-colors"
        aria-label={t("notifications.title")}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-[#1A1A1A] border-2 border-[#E5E0D8] dark:border-[#2D2D2D] shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="px-3 py-2 border-b-2 border-[#E5E0D8] dark:border-[#2D2D2D] flex items-center justify-between">
            <h3 className="font-serif text-sm font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("notifications.title")}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-[#0F4C81] dark:hover:text-[#5BA3D9] transition-colors"
              >
                {t("notifications.markRead")}
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <FiBell className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={24} />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t("notifications.empty")}
              </p>
            </div>
          ) : (
            <div>
              {notifications.slice(0, 20).map((n) => (
                <a
                  key={n.id}
                  href={
                    n.eventId
                      ? `/events/${n.eventId}`
                      : n.type === "OUTLOOK"
                      ? "/outlook"
                      : "#"
                  }
                  className="flex items-start gap-2.5 px-3 py-2.5 border-b border-[#E5E0D8] dark:border-[#2D2D2D] last:border-b-0 hover:bg-[#FAF7F2] dark:hover:bg-[#222] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <NotificationIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1A1A1A] dark:text-[#F5F5F4] leading-tight">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
