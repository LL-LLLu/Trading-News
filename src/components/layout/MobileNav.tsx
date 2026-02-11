"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiGrid,
} from "react-icons/fi";

const navItems = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/calendar", label: "Calendar", icon: FiCalendar },
  { href: "/outlook", label: "Outlook", icon: FiTrendingUp },
  { href: "/history", label: "History", icon: FiClock },
  { href: "/sectors", label: "Sectors", icon: FiGrid },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
