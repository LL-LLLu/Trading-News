"use client";

import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400",
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
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
