"use client";

import { FiTrendingUp } from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiTrendingUp className="text-white" size={14} />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Trading News
          </span>
        </div>

        {/* Page title (desktop) */}
        <h2 className="hidden md:block text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
