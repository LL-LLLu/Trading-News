"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  eventId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

interface NotificationPrefs {
  countdown: boolean;
  surprise: boolean;
  outlook: boolean;
  watchlist: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  prefs: NotificationPrefs;
  markAllRead: () => void;
  updatePref: (key: keyof NotificationPrefs, value: boolean) => void;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const DEFAULT_PREFS: NotificationPrefs = {
  countdown: true,
  surprise: true,
  outlook: true,
  watchlist: true,
};

const POLL_INTERVAL = 60_000; // Poll server every 60s
const COUNTDOWN_WARN_MINUTES = [15, 5]; // Alert at 15min and 5min before

function getPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const saved = localStorage.getItem("notificationPrefs");
    return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function getLastSeen(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("notificationLastSeen");
}

function sendBrowserNotification(title: string, body: string, url?: string) {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  const n = new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: `tn-${Date.now()}`,
  });

  if (url) {
    n.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const scheduledTimers = useRef<Set<string>>(new Set());
  const seenServerIds = useRef<Set<string>>(new Set());

  // Initialize
  useEffect(() => {
    setPrefs(getPrefs());
    setLastSeen(getLastSeen());
    if ("Notification" in window) {
      setPermissionGranted(Notification.permission === "granted");
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermissionGranted(result === "granted");
    }
  }, []);

  const updatePref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem("notificationPrefs", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setLastSeen(now);
    localStorage.setItem("notificationLastSeen", now);
  }, []);

  // Poll server for new notifications (surprise, outlook)
  const pollServer = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (!res.ok) return;
      const data: AppNotification[] = await res.json();

      // Send browser notifications for new items
      for (const n of data) {
        if (seenServerIds.current.has(n.id)) continue;
        seenServerIds.current.add(n.id);

        // Skip browser push for types the user disabled
        if (n.type === "SURPRISE" && !prefs.surprise) continue;
        if (n.type === "OUTLOOK" && !prefs.outlook) continue;

        // Only push if it's genuinely new (created after last seen)
        if (lastSeen && new Date(n.createdAt) <= new Date(lastSeen)) continue;

        sendBrowserNotification(
          n.title,
          n.body,
          n.eventId ? `/events/${n.eventId}` : "/outlook"
        );
      }

      setNotifications(data);
    } catch {
      // Silently fail polling
    }
  }, [prefs.surprise, prefs.outlook, lastSeen]);

  useEffect(() => {
    pollServer();
    const interval = setInterval(pollServer, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pollServer]);

  // Schedule countdown notifications for upcoming events
  useEffect(() => {
    if (!prefs.countdown && !prefs.watchlist) return;

    async function scheduleCountdowns() {
      try {
        const res = await fetch("/api/events?includeAnalysis=false");
        if (!res.ok) return;
        const events = await res.json();
        const now = Date.now();
        const watchlist: string[] = JSON.parse(
          localStorage.getItem("watchlist") || "[]"
        );

        for (const event of events) {
          const eventTime = new Date(event.dateTime).getTime();

          for (const minBefore of COUNTDOWN_WARN_MINUTES) {
            const alertTime = eventTime - minBefore * 60 * 1000;
            const delay = alertTime - now;
            const timerId = `${event.id}-${minBefore}`;

            if (delay <= 0 || delay > 24 * 60 * 60 * 1000) continue; // Only schedule within 24h
            if (scheduledTimers.current.has(timerId)) continue;

            const isWatchlisted = watchlist.includes(event.eventName);
            const isHigh = event.importance === "HIGH";

            // Countdown alerts for HIGH events, watchlist alerts for any watchlisted event
            if ((prefs.countdown && isHigh) || (prefs.watchlist && isWatchlisted)) {
              scheduledTimers.current.add(timerId);
              setTimeout(() => {
                const label = isWatchlisted ? "Watchlist" : "Countdown";
                sendBrowserNotification(
                  `${label}: ${event.eventName}`,
                  `Releasing in ${minBefore} minutes`,
                  `/events/${event.id}`
                );
                // Also add to in-app notifications
                setNotifications((prev) => [
                  {
                    id: timerId,
                    type: "EVENT_COUNTDOWN",
                    title: `${event.eventName}`,
                    body: `Releasing in ${minBefore} minutes`,
                    eventId: event.id,
                    metadata: null,
                    createdAt: new Date().toISOString(),
                  },
                  ...prev,
                ]);
              }, delay);
            }
          }
        }
      } catch {
        // Silently fail
      }
    }

    scheduleCountdowns();
  }, [prefs.countdown, prefs.watchlist]);

  const unreadCount = lastSeen
    ? notifications.filter((n) => new Date(n.createdAt) > new Date(lastSeen))
        .length
    : notifications.length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        prefs,
        markAllRead,
        updatePref,
        permissionGranted,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
}
