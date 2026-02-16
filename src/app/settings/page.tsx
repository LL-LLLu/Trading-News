"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  FiStar,
  FiTrash2,
  FiMoon,
  FiSun,
  FiBell,
  FiGlobe,
} from "react-icons/fi";
import type { Language } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const NOTIF_TOGGLES: {
  key: "countdown" | "surprise" | "outlook" | "watchlist";
  labelKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    key: "countdown",
    labelKey: "notifications.countdown",
    descKey: "notifications.countdownDesc",
  },
  {
    key: "surprise",
    labelKey: "notifications.surprise",
    descKey: "notifications.surpriseDesc",
  },
  {
    key: "outlook",
    labelKey: "notifications.outlook",
    descKey: "notifications.outlookDesc",
  },
  {
    key: "watchlist",
    labelKey: "notifications.watchlist",
    descKey: "notifications.watchlistDesc",
  },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { prefs, updatePref, permissionGranted, requestPermission } =
    useNotifications();
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  function removeFromWatchlist(eventName: string) {
    const updated = watchlist.filter((w) => w !== eventName);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen">
      <Header titleKey="nav.settings" />
      <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto space-y-6">
        {/* Language */}
        <Card>
          <CardHeader>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("settings.language")}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiGlobe className="text-blue-500" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("settings.language")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.languageDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-sm p-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                      language === lang.code
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("settings.appearance")}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <FiMoon className="text-blue-400" size={20} />
                ) : (
                  <FiSun className="text-amber-500" size={20} />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {theme === "dark"
                      ? t("settings.darkMode")
                      : t("settings.lightMode")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.themeDesc")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex items-center shrink-0 w-11 h-6 rounded-full transition-colors ${
                  theme === "dark" ? "bg-[#0F4C81]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("settings.notifications")}
            </h2>
          </CardHeader>
          <CardContent>
            {/* Browser permission */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
              <div className="flex items-center gap-3">
                <FiBell
                  className={
                    permissionGranted
                      ? "text-[#0F4C81] dark:text-[#5BA3D9]"
                      : "text-gray-400"
                  }
                  size={20}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("settings.browserNotifications")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.notifDesc")}
                  </p>
                </div>
              </div>
              {permissionGranted ? (
                <span className="text-xs font-medium text-[#0F4C81] dark:text-[#5BA3D9]">
                  {t("settings.enabled")}
                </span>
              ) : (
                <button
                  onClick={requestPermission}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0F4C81] rounded-sm hover:bg-[#0F4C81]/90 transition-colors"
                >
                  {t("settings.enable")}
                </button>
              )}
            </div>

            {/* Individual toggles */}
            <div className="space-y-3 pt-3">
              {NOTIF_TOGGLES.map((toggle) => (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(toggle.labelKey)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(toggle.descKey)}
                    </p>
                  </div>
                  <button
                    onClick={() => updatePref(toggle.key, !prefs[toggle.key])}
                    className={`relative inline-flex items-center shrink-0 w-11 h-6 rounded-full transition-colors ${
                      prefs[toggle.key]
                        ? "bg-[#0F4C81]"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        prefs[toggle.key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                {t("settings.watchlist")}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {watchlist.length} {t("settings.items")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">
                {t("settings.noWatchlist")}
              </p>
            ) : (
              <ul className="space-y-2">
                {watchlist.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <FiStar
                        className="text-amber-500"
                        size={14}
                        fill="currentColor"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromWatchlist(name)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("settings.about")}
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.aboutDesc")}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
              {t("settings.disclaimer")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
