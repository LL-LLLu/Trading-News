"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiGrid,
  FiMessageSquare,
  FiSettings,
} from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: FiHome },
  { href: "/calendar", label: "Calendar", icon: FiCalendar },
  { href: "/outlook", label: "Outlook", icon: FiTrendingUp },
  { href: "/history", label: "History", icon: FiClock },
  { href: "/sectors", label: "Sectors", icon: FiGrid },
  { href: "/settings", label: "Settings", icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiTrendingUp className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              Trading News
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-500 leading-tight">
              Economic Calendar
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
