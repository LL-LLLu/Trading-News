"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
  FiArrowLeft,
  FiGlobe,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiTarget,
  FiShield,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImpactBadge, ImportanceDot } from "@/components/dashboard/ImpactBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ImpactDirection, Importance } from "@/generated/prisma";

interface EventDetailProps {
  event: {
    id: string;
    eventName: string;
    dateTime: string;
    period: string | null;
    actual: string | null;
    forecast: string | null;
    previous: string | null;
    unit: string | null;
    importance: Importance;
    category: string;
    sourceUrl: string | null;
    analysis: {
      impactScore: number;
      impactDirection: ImpactDirection;
      summary: string;
      detailedAnalysis: string;
      affectedSectors: unknown;
      affectedAssets: unknown;
      tradingImplications: unknown;
      historicalContext: string;
      riskFactors: unknown;
      keyLevelsToWatch: string | null;
      webForecast: string | null;
      webSources: unknown;
    } | null;
  };
}

export function EventDetailClient({ event }: EventDetailProps) {
  const { t } = useLanguage();
  const dateTime = new Date(event.dateTime);
  const analysis = event.analysis;
  const isPast = dateTime < new Date();

  // Compute surprise (actual vs forecast)
  const surprise = computeSurprise(event.actual, event.forecast);

  return (
    <div className="min-h-screen">
      <Header title={event.eventName} />
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft size={14} />
          {t("detail.backToDashboard")}
        </Link>

        {/* ── Hero Header ── */}
        <div className="rounded-none border border-[#E5E0D8] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ImportanceDot importance={event.importance} />
                  <Badge
                    variant={
                      event.importance === "HIGH"
                        ? "danger"
                        : event.importance === "MEDIUM"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {t(`importance.${event.importance}` as "importance.HIGH" | "importance.MEDIUM" | "importance.LOW")} {t("detail.impact")}
                  </Badge>
                  <Badge variant="default">
                    {event.category.replace(/_/g, " ")}
                  </Badge>
                  {isPast && event.actual && (
                    <Badge variant="info">{t("detail.released")}</Badge>
                  )}
                  {!isPast && (
                    <Badge variant="warning">{t("detail.upcoming")}</Badge>
                  )}
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
                  {event.eventName}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <FiClock size={14} />
                  {format(dateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  {event.period && (
                    <span className="text-gray-400 dark:text-gray-600">|</span>
                  )}
                  {event.period && (
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {event.period}
                    </span>
                  )}
                </div>
              </div>
              {analysis && (
                <div className="flex-shrink-0">
                  <ImpactBadge
                    score={analysis.impactScore}
                    direction={analysis.impactDirection}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Data Strip ── */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800 border-t border-[#E5E0D8] dark:border-[#2D2D2D] bg-gray-50 dark:bg-gray-900/50">
            <DataCell
              label={t("data.actual")}
              value={event.actual}
              unit={event.unit}
              highlight={!!event.actual}
              surprise={surprise}
            />
            <DataCell label={t("data.forecast")} value={event.forecast} unit={event.unit} />
            <DataCell label={t("data.previous")} value={event.previous} unit={event.unit} />
          </div>

          {/* ── Surprise Bar (if actual exists) ── */}
          {surprise !== null && (
            <div className="px-6 py-3 border-t border-[#E5E0D8] dark:border-[#2D2D2D] bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                  {t("data.surprise")}
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-400 dark:bg-gray-500" />
                  </div>
                  <div
                    className={`h-full rounded-full transition-all ${
                      surprise > 0
                        ? "bg-green-500 ml-[50%]"
                        : "bg-red-500 mr-[50%] float-right"
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(surprise) * 5, 50)}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-sm font-bold ${
                    surprise > 0
                      ? "text-green-600 dark:text-green-400"
                      : surprise < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500"
                  }`}
                >
                  {surprise > 0 ? "+" : ""}
                  {surprise.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── AI Analysis ── */}
        {analysis ? (
          <>
            {/* Summary + Direction Overview */}
            <Card>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center ${
                      analysis.impactDirection === "BULLISH"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : analysis.impactDirection === "BEARISH"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {analysis.impactDirection === "BULLISH" ? (
                      <FiTrendingUp className="text-green-600 dark:text-green-400" size={20} />
                    ) : analysis.impactDirection === "BEARISH" ? (
                      <FiTrendingDown className="text-red-600 dark:text-red-400" size={20} />
                    ) : (
                      <FiActivity className="text-gray-500" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                        {t("detail.aiSummary")}
                      </h2>
                      <Badge
                        variant={
                          analysis.impactDirection === "BULLISH"
                            ? "success"
                            : analysis.impactDirection === "BEARISH"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {analysis.impactDirection}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-blue-500" size={16} />
                  <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                    {t("detail.detailedAnalysis")}
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.detailedAnalysis
                    .split("\n")
                    .filter((p) => p.trim())
                    .map((p, i) => (
                      <p
                        key={i}
                        className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                      >
                        {p}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Glance: Sectors + Assets + Key Levels in compact grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-3">
                    <FiLayers className="text-blue-500" size={14} />
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      {t("detail.sectors")}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.affectedSectors as string[]).map((s) => (
                      <Badge key={s} variant="info" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-3">
                    <FiTarget className="text-amber-500" size={14} />
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      {t("detail.assets")}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.affectedAssets as string[]).map((a) => (
                      <Badge key={a} variant="warning" className="text-[10px]">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-3">
                    <FiActivity className="text-purple-500" size={14} />
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      {t("detail.keyLevels")}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {analysis.keyLevelsToWatch || t("detail.noLevels")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trading Implications + Risk Factors side by side */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-green-600" size={16} />
                    <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                      {t("detail.tradingImplications")}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysis.tradingImplications as string[]).map((impl, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span className="text-green-600 mt-0.5 flex-shrink-0">&#9656;</span>
                        <span className="leading-relaxed">{impl}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FiShield className="text-red-500" size={16} />
                    <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                      {t("detail.riskFactors")}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysis.riskFactors as string[]).map((risk, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span className="text-red-400 mt-0.5 flex-shrink-0">&#9679;</span>
                        <span className="leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Historical Context */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FiClock className="text-indigo-500" size={16} />
                  <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                    {t("detail.historicalContext")}
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {analysis.historicalContext}
                </p>
              </CardContent>
            </Card>

            {/* ── Web Forecast / Review ── */}
            {analysis.webForecast && (
              <WebForecastCard
                forecast={analysis.webForecast}
                sources={analysis.webSources}
              />
            )}

            {/* ── Sources ── */}
            {analysis.webSources && (
              <SourcesCard sources={analysis.webSources} />
            )}
          </>
        ) : (
          <Card>
            <CardContent>
              <p className="text-center text-gray-500 dark:text-gray-500 py-8">
                {t("detail.analysisPending")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Web Forecast Card ──────────────────────────────────────────────

function WebForecastCard({
  forecast,
  sources,
}: {
  forecast: string;
  sources: unknown;
}) {
  const { t } = useLanguage();
  const isPostRelease = forecast.startsWith("[POST-RELEASE REVIEW]");
  const sourceList = Array.isArray(sources)
    ? (sources as Array<{ title: string; url?: string }>)
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiGlobe className="text-blue-500" size={16} />
            <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {isPostRelease ? t("detail.marketReview") : t("detail.preReleaseForecast")}
            </h3>
            <Badge variant={isPostRelease ? "info" : "warning"}>
              {isPostRelease ? t("detail.postRelease") : t("detail.preRelease")}
            </Badge>
          </div>
          {sourceList.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              {deduplicateSources(sourceList).length} {t("detail.sources").toLowerCase()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ForecastContent text={forecast} />
      </CardContent>
    </Card>
  );
}

// ── Sources Card (standalone, prominent) ─────────────────────────────

function SourcesCard({ sources }: { sources: unknown }) {
  const { t } = useLanguage();
  const sourceList = Array.isArray(sources)
    ? (sources as Array<{ title: string; url?: string }>)
    : [];
  const dedupedSources = deduplicateSources(sourceList);

  if (dedupedSources.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiGlobe className="text-blue-500" size={16} />
            <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
              {t("detail.sources")}
            </h3>
            <Badge variant="default">{dedupedSources.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dedupedSources.map((source, i) => (
            <SourceItem key={i} source={source} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Source Item (favicon + domain name) ──────────────────────────────

function SourceItem({ source }: { source: { title: string; url?: string } }) {
  const domain = getSourceDomain(source);
  const displayName = domain
    ? domain.replace(/\.(com|org|net|io|co)$/, "").replace(/\./g, " ")
    : source.title;
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    : null;

  const content = (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-gray-50 dark:bg-gray-800/50 border border-[#E5E0D8] dark:border-[#2D2D2D] hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {faviconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconUrl}
            alt={domain || source.title}
            width={16}
            height={16}
            className="rounded-sm"
          />
        ) : (
          <FiGlobe size={14} className="text-gray-400" />
        )}
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 truncate capitalize">
        {displayName}
      </span>
    </div>
  );

  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}

/**
 * Extract real domain from a source. Gemini grounding returns Google redirect
 * URLs (vertexaisearch.cloud.google.com/...) but the title field contains
 * the actual source domain (e.g. "goldmansachs.com", "seekingalpha.com").
 */
function getSourceDomain(source: { title: string; url?: string }): string | null {
  // If the title looks like a domain name, use it directly
  if (source.title && /\.[a-z]{2,}$/i.test(source.title)) {
    return source.title.replace(/^www\./, "");
  }
  // Fallback: try to extract from URL (for non-Google-redirect URLs)
  if (source.url) {
    try {
      const hostname = new URL(source.url).hostname.replace("www.", "");
      // Skip Google redirect domains
      if (!hostname.includes("google.com") && !hostname.includes("googleapis.com")) {
        return hostname;
      }
    } catch {
      // ignore
    }
  }
  return source.title || null;
}

function deduplicateSources(
  sources: Array<{ title: string; url?: string }>
): Array<{ title: string; url?: string }> {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const domain = getSourceDomain(s);
    if (!domain || seen.has(domain)) return false;
    seen.add(domain);
    return true;
  });
}

// ── Forecast Content Renderer ──────────────────────────────────────

function ForecastContent({ text }: { text: string }) {
  const cleaned = text.replace(
    /^\[(POST-RELEASE REVIEW|PRE-RELEASE FORECAST)\]\n\n/,
    ""
  );

  const sections: Array<{ heading?: string; body: string }> = [];
  const parts = cleaned.split(/^## /m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const newlineIdx = trimmed.indexOf("\n");
    if (newlineIdx === -1) {
      sections.push({ body: trimmed });
    } else if (sections.length === 0 && !cleaned.startsWith("## ")) {
      sections.push({ body: trimmed });
    } else {
      sections.push({
        heading: trimmed.slice(0, newlineIdx).trim(),
        body: trimmed.slice(newlineIdx + 1).trim(),
      });
    }
  }

  if (sections.length <= 1) {
    return (
      <div className="space-y-3">
        {cleaned
          .split("\n")
          .filter((p) => p.trim())
          .map((p, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {p}
            </p>
          ))}
      </div>
    );
  }

  const sectionConfig: Record<string, { icon: typeof FiGlobe; color: string }> = {
    "Market Reaction": { icon: FiBarChart2, color: "text-blue-500" },
    "Wall Street Analysis": { icon: FiTarget, color: "text-indigo-500" },
    "Fed Policy Implications": { icon: FiActivity, color: "text-purple-500" },
    "Consensus Forecast": { icon: FiBarChart2, color: "text-blue-500" },
    "Key Drivers": { icon: FiTrendingUp, color: "text-green-600" },
    "Upside/Downside Scenarios": { icon: FiActivity, color: "text-amber-500" },
    "Historical Context": { icon: FiClock, color: "text-indigo-500" },
    "Counter Argument": { icon: FiAlertTriangle, color: "text-red-500" },
  };

  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        const cfg = section.heading
          ? sectionConfig[section.heading]
          : undefined;
        const Icon = cfg?.icon || FiGlobe;

        return (
          <div key={i}>
            {section.heading && (
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={cfg?.color || "text-gray-400"} />
                <h4 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F5F5F4]">
                  {section.heading}
                </h4>
              </div>
            )}
            <div className="space-y-2 pl-6">
              {section.body
                .split("\n")
                .filter((p) => p.trim())
                .map((p, j) => (
                  <p
                    key={j}
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                  >
                    {renderBold(p)}
                  </p>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Render **bold** text as actual bold spans
function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="font-semibold text-gray-800 dark:text-gray-200">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

// ── Data Cell ──────────────────────────────────────────────────────

function DataCell({
  label,
  value,
  unit,
  highlight,
  surprise,
}: {
  label: string;
  value: string | null;
  unit: string | null;
  highlight?: boolean;
  surprise?: number | null;
}) {
  return (
    <div className="px-5 py-4 text-center">
      <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-xl font-bold ${
          highlight && value
            ? surprise && surprise > 0
              ? "text-green-600 dark:text-green-400"
              : surprise && surprise < 0
                ? "text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-white"
            : value
              ? "text-gray-900 dark:text-white"
              : "text-gray-300 dark:text-gray-700"
        }`}
      >
        {value || "--"}
        {value && unit && (
          <span className="text-xs font-normal text-gray-500 ml-0.5">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function computeSurprise(
  actual: string | null,
  forecast: string | null
): number | null {
  if (!actual || !forecast) return null;
  const a = parseNumericValue(actual);
  const f = parseNumericValue(forecast);
  if (a === null || f === null || f === 0) return null;
  return ((a - f) / Math.abs(f)) * 100;
}

function parseNumericValue(val: string): number | null {
  // Strip common suffixes: %, K, M, B, $, etc.
  const cleaned = val.replace(/[%$KMBkmb,]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
