"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiTrendingUp, FiUser } from "react-icons/fi";
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.authenticated))
      .catch(() => {});
  }, []);

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
          <Link
            href={isAdmin ? "/admin" : "/admin/login"}
            className="p-2 text-[#6B7280] hover:text-[#0F4C81] dark:hover:text-[#5BA3D9] transition-colors"
            title={isAdmin ? "Admin Dashboard" : "Admin Login"}
          >
            <FiUser size={18} />
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
