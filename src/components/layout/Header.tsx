"use client";

import { FiTrendingUp } from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

export function Header({
  title,
  titleKey,
}: {
  title?: string;
  titleKey?: TranslationKey;
}) {
  const { t } = useLanguage();
  const displayTitle = titleKey ? t(titleKey) : title || "";

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#1A1A1A] border-b-2 border-[#E5E0D8] dark:border-[#2D2D2D]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 bg-[#0F4C81] rounded-sm flex items-center justify-center">
            <FiTrendingUp className="text-white" size={14} />
          </div>
          <span className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-[#F5F5F4]">
            {t("brand.title")}
          </span>
        </div>

        {/* Page title (desktop) */}
        <h2 className="hidden md:block font-serif text-xl font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
          {displayTitle}
        </h2>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <NotificationBell />
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
