"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiCalendar,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiX,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickStatsProps {
  totalEvents: number;
  highImpactCount: number;
  weekSentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  nextEvent: {
    eventName: string;
    dateTime: string;
  } | null;
  currentWeek?: Date;
}

export function QuickStats({
  totalEvents,
  highImpactCount,
  weekSentiment,
  nextEvent,
  currentWeek,
}: QuickStatsProps) {
  const { t, language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const sentimentConfig = {
    BULLISH: { color: "text-green-600 dark:text-green-400", labelKey: "stats.bullish" as const },
    BEARISH: { color: "text-red-600 dark:text-red-400", labelKey: "stats.bearish" as const },
    NEUTRAL: { color: "text-gray-600 dark:text-gray-400", labelKey: "stats.neutral" as const },
  };

  const sentiment = weekSentiment ? sentimentConfig[weekSentiment] : null;
  const dateFnsLocale = language === "zh" ? { locale: zhCN } : undefined;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<FiCalendar size={18} />}
          label={t("stats.totalEvents")}
          value={totalEvents.toString()}
          iconColor="text-[#0F4C81]"
        />
        <StatCard
          icon={<FiAlertTriangle size={18} />}
          label={t("stats.highImpact")}
          value={highImpactCount.toString()}
          iconColor="text-red-500"
        />
        <StatCard
          icon={<FiTrendingUp size={18} />}
          label={t("stats.weekSentiment")}
          value={sentiment ? t(sentiment.labelKey) : t("stats.pending")}
          valueColor={sentiment?.color}
          iconColor="text-green-600"
          onClick={weekSentiment ? () => setShowModal(true) : undefined}
          clickable={!!weekSentiment}
        />
        <StatCard
          icon={<FiClock size={18} />}
          label={t("stats.nextEvent")}
          value={
            nextEvent
              ? formatDistanceToNow(new Date(nextEvent.dateTime), {
                  addSuffix: true,
                  ...dateFnsLocale,
                })
              : t("stats.none")
          }
          subtitle={nextEvent?.eventName}
          iconColor="text-amber-500"
        />
      </div>

      {showModal && (
        <SentimentModal
          currentWeek={currentWeek}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function SentimentModal({
  currentWeek,
  onClose,
}: {
  currentWeek?: Date;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentWeek) params.set("week", currentWeek.toISOString());

    const abortController = new AbortController();

    fetch(`/api/sentiment?${params}`, { signal: abortController.signal })
      .then(async (res) => {
        if (!res.ok) {
          setError("Failed to load sentiment analysis");
          setLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setLoading(false);
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  setError(parsed.error);
                  setLoading(false);
                } else if (parsed.text) {
                  setContent((prev) => prev + parsed.text);
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to connect");
          setLoading(false);
        }
      });

    return () => abortController.abort();
  }, [currentWeek]);

  // Auto-scroll as content streams in
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-[#0F4C81]" size={18} />
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
              Weekly Sentiment Analysis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F4] transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <div className="w-4 h-4 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
              Analyzing this week&apos;s events...
            </div>
          ) : null}

          {loading && content && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#6B7280]">
              <div className="w-3 h-3 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
              Generating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  valueColor,
  iconColor,
  onClick,
  clickable,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  iconColor?: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none border-t-2 border-t-[#0F4C81] p-4 ${
        clickable
          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 hover:shadow-sm transition-all"
          : ""
      }`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick?.();
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColor || "text-[#6B7280]"}>{icon}</span>
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`font-serif text-xl font-bold ${
          valueColor || "text-[#1A1A1A] dark:text-[#F5F5F4]"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[#6B7280] truncate mt-0.5">
          {subtitle}
        </p>
      )}
      {clickable && (
        <p className="text-[10px] text-[#0F4C81] dark:text-[#5BA3D9] mt-1">
          Click for AI analysis
        </p>
      )}
    </div>
  );
}
