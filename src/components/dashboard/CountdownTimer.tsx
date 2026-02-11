"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { ImportanceDot } from "./ImpactBadge";

interface CountdownTimerProps {
  event: {
    eventName: string;
    dateTime: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
    category: string;
  } | null;
}

export function CountdownTimer({ event }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!event) return;

    const target = new Date(event.dateTime);

    function update() {
      const now = new Date();
      const diff = differenceInSeconds(target, now);

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 text-white">
        <p className="text-sm text-gray-400">No upcoming high-impact events</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-blue-900 dark:from-emerald-950 dark:to-blue-950 rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <ImportanceDot importance={event.importance} />
        <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">
          Next High-Impact Event
        </span>
      </div>
      <h3 className="text-lg font-bold mb-4">{event.eventName}</h3>

      {timeLeft ? (
        <div className="flex gap-3">
          {timeLeft.days > 0 && (
            <TimeUnit value={timeLeft.days} label="Days" />
          )}
          <TimeUnit value={timeLeft.hours} label="Hrs" />
          <TimeUnit value={timeLeft.minutes} label="Min" />
          <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>
      ) : (
        <p className="text-emerald-300 font-medium">Event in progress or completed</p>
      )}
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[60px] text-center">
      <p className="text-2xl font-mono font-bold">
        {value.toString().padStart(2, "0")}
      </p>
      <p className="text-[10px] text-emerald-200 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}
