"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

const navItems: {
  href: string;
  labelKey: TranslationKey;
  icon: typeof FiHome;
}[] = [
  { href: "/", labelKey: "nav.home", icon: FiHome },
  { href: "/calendar", labelKey: "nav.calendar", icon: FiCalendar },
  { href: "/outlook", labelKey: "nav.outlook", icon: FiTrendingUp },
  { href: "/history", labelKey: "nav.history", icon: FiClock },
  { href: "/evaluations", labelKey: "nav.evaluations", icon: FiFileText },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] border-t border-[#E5E0D8] dark:border-[#2D2D2D] z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-[#0F4C81] dark:text-[#5BA3D9]"
                  : "text-[#6B7280]"
              }`}
            >
              <item.icon size={20} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
