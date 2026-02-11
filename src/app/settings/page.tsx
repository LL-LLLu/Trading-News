"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useTheme } from "@/contexts/ThemeContext";
import { FiStar, FiTrash2, FiMoon, FiSun, FiBell } from "react-icons/fi";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
    setNotificationsEnabled(Notification.permission === "granted");
  }, []);

  function removeFromWatchlist(eventName: string) {
    const updated = watchlist.filter((w) => w !== eventName);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  }

  async function requestNotifications() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Settings" />
      <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Appearance
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
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle between light and dark themes
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === "dark" ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiBell
                  className={
                    notificationsEnabled ? "text-emerald-500" : "text-gray-400"
                  }
                  size={20}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Browser Notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get alerts for high-impact events and surprise data
                  </p>
                </div>
              </div>
              {notificationsEnabled ? (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Enabled
                </span>
              ) : (
                <button
                  onClick={requestNotifications}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Watchlist
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {watchlist.length} items
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">
                No events in your watchlist. Click the star icon on events to add them.
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              About
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trading News Dashboard provides AI-powered analysis of economic calendar events.
              Data is sourced from MarketWatch and analyzed using Google Gemini AI.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
              This tool is for informational purposes only. Not financial advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
