"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiGrid,
  FiSettings,
} from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

const navItems: { href: string; labelKey: TranslationKey; icon: typeof FiHome }[] = [
  { href: "/", labelKey: "nav.dashboard", icon: FiHome },
  { href: "/calendar", labelKey: "nav.calendar", icon: FiCalendar },
  { href: "/outlook", labelKey: "nav.outlook", icon: FiTrendingUp },
  { href: "/history", labelKey: "nav.history", icon: FiClock },
  { href: "/sectors", labelKey: "nav.sectors", icon: FiGrid },
  { href: "/settings", labelKey: "nav.settings", icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#FAF7F2] dark:bg-[#111111] border-r border-[#E5E0D8] dark:border-[#2D2D2D] h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0F4C81] rounded-sm flex items-center justify-center">
            <FiTrendingUp className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold text-[#1A1A1A] dark:text-[#F5F5F4] leading-tight tracking-wide">
              {t("brand.title")}
            </h1>
            <p className="text-[10px] text-[#6B7280] leading-tight">
              {t("brand.subtitle")}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-l-2 border-[#0F4C81] text-[#0F4C81] dark:text-[#5BA3D9]"
                  : "text-[#6B7280] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F4]"
              }`}
            >
              <item.icon size={18} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-4 py-3 border-t border-[#E5E0D8] dark:border-[#2D2D2D]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">
            {t("sidebar.theme")}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
