"use client";

import { format } from "date-fns";
import Link from "next/link";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImpactBadge, ImportanceDot } from "@/components/dashboard/ImpactBadge";
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
    } | null;
  };
}

export function EventDetailClient({ event }: EventDetailProps) {
  const dateTime = new Date(event.dateTime);
  const analysis = event.analysis;

  return (
    <div className="min-h-screen">
      <Header title={event.eventName} />
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft size={14} />
          Back to Dashboard
        </Link>

        {/* Event header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
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
                {event.importance}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-500 uppercase">
                {event.category.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {event.eventName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {format(dateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              {event.period && ` | ${event.period}`}
            </p>
          </div>
          {analysis && (
            <ImpactBadge
              score={analysis.impactScore}
              direction={analysis.impactDirection}
            />
          )}
        </div>

        {/* Data values */}
        <div className="grid grid-cols-3 gap-4">
          <DataCard label="Actual" value={event.actual} unit={event.unit} highlight />
          <DataCard label="Forecast" value={event.forecast} unit={event.unit} />
          <DataCard label="Previous" value={event.previous} unit={event.unit} />
        </div>

        {/* AI Analysis */}
        {analysis ? (
          <>
            {/* Summary */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Analysis
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {analysis.summary}
                </p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {analysis.detailedAnalysis.split("\n").map((p, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-400">
                      {p}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Affected Sectors & Assets */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Affected Sectors
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.affectedSectors as string[]).map((sector) => (
                      <Badge key={sector} variant="info">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Affected Assets
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.affectedAssets as string[]).map((asset) => (
                      <Badge key={asset} variant="warning">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Implications */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Trading Implications
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.tradingImplications as string[]).map((impl, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-emerald-500 mt-1">&#9656;</span>
                      {impl}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Historical Context */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Historical Context
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analysis.historicalContext}
                </p>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Risk Factors
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.riskFactors as string[]).map((risk, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-red-500 mt-1">&#9679;</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Key Levels */}
            {analysis.keyLevelsToWatch && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Key Levels to Watch
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {analysis.keyLevelsToWatch}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent>
              <p className="text-center text-gray-500 dark:text-gray-500 py-8">
                AI analysis pending. Analysis runs automatically after data is scraped.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Source link */}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <FiExternalLink size={14} />
            View on MarketWatch
          </a>
        )}
      </div>
    </div>
  );
}

function DataCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string | null;
  unit: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight && value
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      }`}
    >
      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          value
            ? "text-gray-900 dark:text-white"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {value || "--"}
        {value && unit && (
          <span className="text-sm font-normal text-gray-500 ml-1">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
