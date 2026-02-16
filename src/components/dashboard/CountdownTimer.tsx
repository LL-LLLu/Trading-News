"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { ImportanceDot } from "./ImpactBadge";
import { useLanguage } from "@/contexts/LanguageContext";

interface CountdownTimerProps {
  event: {
    eventName: string;
    dateTime: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
    category: string;
  } | null;
}

export function CountdownTimer({ event }: CountdownTimerProps) {
  const { t } = useLanguage();
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
      <div className="bg-gray-900 dark:bg-gray-800 rounded-none p-5 text-white">
        <p className="text-sm text-gray-400">{t("countdown.noUpcoming")}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F4C81] rounded-none p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <ImportanceDot importance={event.importance} />
        <span className="text-xs font-medium text-blue-200 uppercase tracking-wide">
          {t("countdown.nextHighImpact")}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold mb-4">{event.eventName}</h3>

      {timeLeft ? (
        <div className="flex gap-3">
          {timeLeft.days > 0 && (
            <TimeUnit value={timeLeft.days} label={t("countdown.days")} />
          )}
          <TimeUnit value={timeLeft.hours} label={t("countdown.hrs")} />
          <TimeUnit value={timeLeft.minutes} label={t("countdown.min")} />
          <TimeUnit value={timeLeft.seconds} label={t("countdown.sec")} />
        </div>
      ) : (
        <p className="text-blue-200 font-medium">{t("countdown.inProgress")}</p>
      )}
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/10 rounded-none px-3 py-2 min-w-[60px] text-center">
      <p className="text-2xl font-mono font-bold">
        {value.toString().padStart(2, "0")}
      </p>
      <p className="text-[10px] text-blue-200 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}
