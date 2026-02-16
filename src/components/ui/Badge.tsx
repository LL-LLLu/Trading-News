"use client";

import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
  info: "bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-[#5BA3D9]/20 dark:text-[#5BA3D9]",
  neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
