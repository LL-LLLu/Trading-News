"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  formatDistanceToNow,
  type FormatOptions,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiCalendar,
  FiAlertTriangle,
  FiZap,
  FiTarget,
  FiShield,
  FiLayers,
  FiClock,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface OutlookData {
  id: string;
  weekStart: string;
  weekEnd: string;
  overallSentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  executiveSummary: string;
  keyEvents: unknown;
  themeAnalysis: unknown;
  riskAssessment: unknown;
  sectorRotation: unknown;
  createdAt: string;
}

type KeyEvent = {
  eventName: string;
  impactScore: number;
  reasoning: string;
};
type Theme = {
  theme: string;
  description: string;
  implications: string;
};
type Risk = {
  risk: string;
  probability: "HIGH" | "MEDIUM" | "LOW";
  impact: string;
};
type Sector = {
  sector: string;
  outlook: "OVERWEIGHT" | "NEUTRAL" | "UNDERWEIGHT";
  reasoning: string;
};

export function OutlookClient({
  initialOutlook,
}: {
  initialOutlook: OutlookData | null;
}) {
  const { t, language } = useLanguage();
  const dateFnsLocale = language === "zh" ? zhCN : undefined;

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [outlook, setOutlook] = useState<OutlookData | null>(initialOutlook);
  const [loading, setLoading] = useState(false);

  const isCurrentWeek =
    startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() ===
    startOfWeek(currentWeek, { weekStartsOn: 1 }).getTime();

  const fetchOutlook = useCallback(async (weekDate: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/outlook?week=${weekDate.toISOString()}`);
      const data = await res.json();
      setOutlook(data.outlook);
    } catch {
      setOutlook(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleWeekChange(date: Date) {
    setCurrentWeek(date);
    fetchOutlook(date);
  }

  // Parsed typed data
  const keyEvents = (outlook?.keyEvents as KeyEvent[]) || [];
  const themes = (outlook?.themeAnalysis as Theme[]) || [];
  const risks = (outlook?.riskAssessment as Risk[]) || [];
  const sectors = (outlook?.sectorRotation as Sector[]) || [];

  const sentimentConfig = {
    BULLISH: {
      label: t("outlook.bullish"),
      variant: "success" as const,
      color: "green",
      Icon: FiTrendingUp,
      accentBorder: "border-l-green-500",
      accentBg: "bg-green-500",
    },
    BEARISH: {
      label: t("outlook.bearish"),
      variant: "danger" as const,
      color: "red",
      Icon: FiTrendingDown,
      accentBorder: "border-l-red-500",
      accentBg: "bg-red-500",
    },
    NEUTRAL: {
      label: t("outlook.neutralOutlook"),
      variant: "neutral" as const,
      color: "gray",
      Icon: FiMinus,
      accentBorder: "border-l-gray-400",
      accentBg: "bg-gray-400",
    },
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addWeeks(weekStart, 1);

  // ── Empty state ──
  if (!outlook && !loading) {
    return (
      <div className="min-h-screen">
        <Header titleKey="nav.outlook" />
        <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
          {/* Week Navigator */}
          <div className="flex items-center justify-center">
            <WeekNav
              weekStart={weekStart}
              weekEnd={weekEnd}
              isCurrentWeek={isCurrentWeek}
              onPrev={() => handleWeekChange(subWeeks(currentWeek, 1))}
              onNext={() => handleWeekChange(addWeeks(currentWeek, 1))}
              onToday={() => handleWeekChange(new Date())}
              t={t}
              locale={dateFnsLocale}
            />
          </div>
          <Card>
            <CardContent>
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-none flex items-center justify-center mx-auto mb-4">
                  <FiCalendar
                    className="text-gray-400 dark:text-gray-600"
                    size={28}
                  />
                </div>
                <p className="text-gray-500 dark:text-gray-500 mb-2 font-medium">
                  {t("outlook.noOutlook")}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  {t("outlook.noOutlookDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header titleKey="nav.outlook" />
        <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center">
            <WeekNav
              weekStart={weekStart}
              weekEnd={weekEnd}
              isCurrentWeek={isCurrentWeek}
              onPrev={() => handleWeekChange(subWeeks(currentWeek, 1))}
              onNext={() => handleWeekChange(addWeeks(currentWeek, 1))}
              onToday={() => handleWeekChange(new Date())}
              t={t}
              locale={dateFnsLocale}
            />
          </div>
          {/* Skeleton cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sentiment = sentimentConfig[outlook!.overallSentiment];
  const SentimentIcon = sentiment.Icon;
  const highRiskCount = risks.filter((r) => r.probability === "HIGH").length;
  const topSector = sectors.find((s) => s.outlook === "OVERWEIGHT");

  return (
    <div className="min-h-screen">
      <Header titleKey="nav.outlook" />
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Week Navigator */}
        <div className="flex items-center justify-center">
          <WeekNav
            weekStart={weekStart}
            weekEnd={weekEnd}
            isCurrentWeek={isCurrentWeek}
            onPrev={() => handleWeekChange(subWeeks(currentWeek, 1))}
            onNext={() => handleWeekChange(addWeeks(currentWeek, 1))}
            onToday={() => handleWeekChange(new Date())}
            t={t}
            locale={dateFnsLocale}
          />
        </div>

        {/* ── Hero Banner ── */}
        <div
          className={`relative overflow-hidden bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none`}
        >
          {/* Accent strip — no gradient */}
          {/* Top accent bar */}
          <div className={`h-1 ${sentiment.accentBg}`} />

          <div className="relative px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t("outlook.weekOf")}
                </p>
                <h1 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
                  {format(new Date(outlook!.weekStart), "MMM d", {
                    locale: dateFnsLocale,
                  })}{" "}
                  &ndash;{" "}
                  {format(new Date(outlook!.weekEnd), "MMM d, yyyy", {
                    locale: dateFnsLocale,
                  })}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={sentiment.variant}
                  className="text-sm px-3 py-1"
                >
                  <SentimentIcon size={14} className="mr-1.5" />
                  {sentiment.label}
                </Badge>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickStat
                icon={<FiCalendar size={14} />}
                label={t("outlook.eventsThisWeek")}
                value={String(keyEvents.length)}
                color="text-blue-500"
              />
              <QuickStat
                icon={<FiZap size={14} />}
                label={t("outlook.highImpact")}
                value={String(
                  keyEvents.filter((e) => e.impactScore >= 7).length,
                )}
                color="text-red-500"
              />
              <QuickStat
                icon={<FiTarget size={14} />}
                label={t("outlook.topSector")}
                value={topSector?.sector || "—"}
                color="text-green-600"
              />
              <QuickStat
                icon={<FiAlertTriangle size={14} />}
                label={t("outlook.riskLevel")}
                value={
                  highRiskCount > 2
                    ? t("importance.HIGH")
                    : highRiskCount > 0
                      ? t("importance.MEDIUM")
                      : t("importance.LOW")
                }
                color={
                  highRiskCount > 2
                    ? "text-red-500"
                    : highRiskCount > 0
                      ? "text-amber-500"
                      : "text-green-600"
                }
              />
            </div>

            {/* Generated timestamp */}
            {outlook!.createdAt && (
              <p className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-600 mt-4">
                <FiClock size={10} />
                {t("outlook.generatedOn")}{" "}
                {formatDistanceToNow(new Date(outlook!.createdAt), {
                  addSuffix: true,
                  locale: dateFnsLocale,
                })}
              </p>
            )}
          </div>
        </div>

        {/* ── Executive Summary ── */}
        <div
          className={`bg-white dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#2D2D2D] rounded-none overflow-hidden border-l-4 ${sentiment.accentBorder}`}
        >
          <div className="px-5 py-4 border-b border-[#E5E0D8] dark:border-[#2D2D2D]">
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("outlook.executiveSummary")}
            </h2>
          </div>
          <div className="px-5 py-4">
            {outlook!.executiveSummary.split("\n").map((p, i) => (
              <p
                key={i}
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 last:mb-0"
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* ── Key Events Timeline ── */}
        {keyEvents.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FiZap className="text-amber-500" size={18} />
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                  {t("outlook.keyEvents")}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />

                <div className="space-y-5">
                  {keyEvents.map((event, i) => {
                    const scoreColor =
                      event.impactScore >= 8
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        : event.impactScore >= 5
                          ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                          : "text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                    const ringColor =
                      event.impactScore >= 8
                        ? "ring-red-500"
                        : event.impactScore >= 5
                          ? "ring-amber-500"
                          : "ring-green-500";
                    const fillPct = (event.impactScore / 10) * 100;

                    return (
                      <div key={i} className="flex items-start gap-4 relative">
                        {/* Impact ring */}
                        <div
                          className={`relative w-10 h-10 rounded-full bg-white dark:bg-[#1A1A1A] border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 z-10`}
                          style={{
                            background: `conic-gradient(${event.impactScore >= 8 ? "#ef4444" : event.impactScore >= 5 ? "#f59e0b" : "#10b981"} ${fillPct}%, transparent ${fillPct}%)`,
                          }}
                        >
                          <span className="w-7 h-7 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                            {event.impactScore}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {event.eventName}
                            </h3>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm border ${scoreColor}`}
                            >
                              {t("outlook.impactScore")} {event.impactScore}/10
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {event.reasoning}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Key Themes ── */}
        {themes.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FiLayers className="text-blue-500" size={18} />
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                  {t("outlook.keyThemes")}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {themes.map((theme, i) => {
                  const themeColors = [
                    "border-t-blue-500",
                    "border-t-purple-500",
                    "border-t-amber-500",
                    "border-t-green-500",
                    "border-t-red-500",
                    "border-t-cyan-500",
                  ];
                  return (
                    <div
                      key={i}
                      className={`bg-gray-50 dark:bg-gray-800/50 rounded-none overflow-hidden border-t-2 ${themeColors[i % themeColors.length]}`}
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                          {theme.theme}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                          {theme.description}
                        </p>
                        <div className="flex items-start gap-1.5">
                          <FiTarget
                            size={12}
                            className="text-green-600 mt-0.5 shrink-0"
                          />
                          <p className="text-xs text-[#0F4C81] dark:text-[#5BA3D9] font-medium leading-relaxed">
                            {t("outlook.implication")}: {theme.implications}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Risk Assessment ── */}
        {risks.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FiShield className="text-red-500" size={18} />
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                  {t("outlook.riskAssessment")}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risks.map((risk, i) => {
                  const probConfig = {
                    HIGH: {
                      bg: "bg-red-50 dark:bg-red-900/10",
                      border: "border-red-200 dark:border-red-800",
                      dot: "bg-red-500",
                      text: "text-red-700 dark:text-red-400",
                    },
                    MEDIUM: {
                      bg: "bg-amber-50 dark:bg-amber-900/10",
                      border: "border-amber-200 dark:border-amber-800",
                      dot: "bg-amber-500",
                      text: "text-amber-700 dark:text-amber-400",
                    },
                    LOW: {
                      bg: "bg-green-50 dark:bg-green-900/10",
                      border: "border-green-200 dark:border-green-800",
                      dot: "bg-green-500",
                      text: "text-green-700 dark:text-green-400",
                    },
                  };
                  const cfg = probConfig[risk.probability];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-4 py-3 rounded-sm border ${cfg.bg} ${cfg.border}`}
                    >
                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}
                        >
                          {risk.probability}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {risk.risk}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                          {risk.impact}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Sector Rotation ── */}
        {sectors.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="text-green-600" size={18} />
                  <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                    {t("outlook.sectorRotation")}
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-medium">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                    {t("outlook.overweight")}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gray-400" />
                    {t("outlook.neutral")}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                    {t("outlook.underweight")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bar chart */}
              <div className="h-48 mb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sectors.map((s) => ({
                      name:
                        s.sector.length > 12
                          ? s.sector.slice(0, 12) + "…"
                          : s.sector,
                      value:
                        s.outlook === "OVERWEIGHT"
                          ? 1
                          : s.outlook === "UNDERWEIGHT"
                            ? -1
                            : 0,
                      outlook: s.outlook,
                    }))}
                    layout="vertical"
                    margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      domain={[-1.5, 1.5]}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "2px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#f9fafb" }}
                      itemStyle={{ color: "#f9fafb" }}
                      formatter={(value) => {
                        const v = Number(value);
                        return v > 0
                          ? t("outlook.overweight")
                          : v < 0
                            ? t("outlook.underweight")
                            : t("outlook.neutral");
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={16}>
                      {sectors.map((s, i) => (
                        <Cell
                          key={i}
                          fill={
                            s.outlook === "OVERWEIGHT"
                              ? "#10b981"
                              : s.outlook === "UNDERWEIGHT"
                                ? "#ef4444"
                                : "#9ca3af"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sector cards */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sectors.map((sector) => {
                  const outlookStyle = {
                    OVERWEIGHT: {
                      border:
                        "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10",
                      badge: "success" as const,
                      label: t("outlook.overweight"),
                    },
                    NEUTRAL: {
                      border: "border-gray-200 dark:border-gray-700",
                      badge: "neutral" as const,
                      label: t("outlook.neutral"),
                    },
                    UNDERWEIGHT: {
                      border:
                        "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10",
                      badge: "danger" as const,
                      label: t("outlook.underweight"),
                    },
                  };
                  const style = outlookStyle[sector.outlook];
                  return (
                    <div
                      key={sector.sector}
                      className={`border rounded-none p-3 ${style.border}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {sector.sector}
                        </h4>
                        <Badge variant={style.badge}>{style.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {sector.reasoning}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Week Navigator (inline) ──

function WeekNav({
  weekStart,
  weekEnd,
  isCurrentWeek,
  onPrev,
  onNext,
  onToday,
  t,
  locale,
}: {
  weekStart: Date;
  weekEnd: Date;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  t: (key: TranslationKey) => string;
  locale?: FormatOptions["locale"];
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      >
        <FiChevronLeft size={18} />
      </button>

      <div className="text-center min-w-[200px]">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {format(weekStart, "MMM d", { locale })} &ndash;{" "}
          {format(weekEnd, "MMM d, yyyy", { locale })}
        </p>
        {isCurrentWeek && (
          <p className="text-xs text-[#0F4C81] dark:text-[#5BA3D9] font-medium">
            {t("week.currentWeek")}
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      >
        <FiChevronRight size={18} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-xs font-medium text-[#0F4C81] dark:text-[#5BA3D9] bg-transparent border border-[#0F4C81] dark:border-[#5BA3D9] rounded-sm hover:bg-[#0F4C81]/10 dark:hover:bg-[#5BA3D9]/10 transition-colors"
        >
          {t("week.today")}
        </button>
      )}
    </div>
  );
}

// ── Quick Stat ──

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-none px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  );
}
