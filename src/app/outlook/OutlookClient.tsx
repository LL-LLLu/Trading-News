"use client";

import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImpactBadge } from "@/components/dashboard/ImpactBadge";

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
}

export function OutlookClient({
  outlook,
}: {
  outlook: OutlookData | null;
}) {
  if (!outlook) {
    return (
      <div className="min-h-screen">
        <Header title="Weekly Outlook" />
        <div className="px-4 md:px-6 py-6">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-500 mb-2">
                  No weekly outlook available yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  The outlook is generated automatically every Monday at 7 AM UTC.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const keyEvents = outlook.keyEvents as Array<{
    eventName: string;
    impactScore: number;
    reasoning: string;
  }>;
  const themes = outlook.themeAnalysis as Array<{
    theme: string;
    description: string;
    implications: string;
  }>;
  const risks = outlook.riskAssessment as Array<{
    risk: string;
    probability: "HIGH" | "MEDIUM" | "LOW";
    impact: string;
  }>;
  const sectors = outlook.sectorRotation as Array<{
    sector: string;
    outlook: "OVERWEIGHT" | "NEUTRAL" | "UNDERWEIGHT";
    reasoning: string;
  }>;

  const sentimentConfig = {
    BULLISH: { variant: "success" as const, label: "Bullish" },
    BEARISH: { variant: "danger" as const, label: "Bearish" },
    NEUTRAL: { variant: "neutral" as const, label: "Neutral" },
  };

  const sentiment = sentimentConfig[outlook.overallSentiment];

  return (
    <div className="min-h-screen">
      <Header title="Weekly Outlook" />
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Week of {format(new Date(outlook.weekStart), "MMM d")} -{" "}
              {format(new Date(outlook.weekEnd), "MMM d, yyyy")}
            </h1>
            <Badge variant={sentiment.variant} className="mt-1">
              {sentiment.label} Outlook
            </Badge>
          </div>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Executive Summary
            </h2>
          </CardHeader>
          <CardContent>
            {outlook.executiveSummary.split("\n").map((p, i) => (
              <p
                key={i}
                className="text-gray-600 dark:text-gray-400 mb-3 last:mb-0"
              >
                {p}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* Key Events */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Key Events
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyEvents.map((event, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {event.eventName}
                      </h3>
                      <Badge variant="info">{event.impactScore}/10</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Themes */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Key Themes
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {themes.map((theme, i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {theme.theme}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {theme.description}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Implication: {theme.implications}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Assessment
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map((risk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0"
                >
                  <Badge
                    variant={
                      risk.probability === "HIGH"
                        ? "danger"
                        : risk.probability === "MEDIUM"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {risk.probability}
                  </Badge>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                      {risk.risk}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {risk.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Rotation */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sector Rotation
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sectors.map((sector) => {
                const outlookColor = {
                  OVERWEIGHT:
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                  NEUTRAL: "border-gray-300 dark:border-gray-700",
                  UNDERWEIGHT:
                    "border-red-500 bg-red-50 dark:bg-red-900/20",
                };
                return (
                  <div
                    key={sector.sector}
                    className={`border rounded-lg p-3 ${outlookColor[sector.outlook]}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {sector.sector}
                      </h4>
                      <Badge
                        variant={
                          sector.outlook === "OVERWEIGHT"
                            ? "success"
                            : sector.outlook === "UNDERWEIGHT"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {sector.outlook}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {sector.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
