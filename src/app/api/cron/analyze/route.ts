import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  analyzeEvent,
  generateWeeklyOutlook,
  generateWebForecast,
} from "@/lib/gemini";
import { startOfWeek, endOfWeek } from "date-fns";

export const maxDuration = 300; // 5 minutes for AI processing

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get("mode") || "events";
  const force = request.nextUrl.searchParams.get("force") === "true";

  try {
    if (mode === "weekly") {
      return await handleWeeklyOutlook(force);
    }
    if (mode === "forecast") {
      return await handleWebForecasts(force);
    }
    return await handleEventAnalysis(force);
  } catch (error) {
    console.error("Analyze cron failed:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) },
      { status: 500 },
    );
  }
}

async function handleEventAnalysis(force = false) {
  // Find events to analyze
  const events = await prisma.economicEvent.findMany({
    where: force ? {} : { analysis: null },
    include: { analysis: true },
    orderBy: { dateTime: "asc" },
    take: 10,
  });

  if (events.length === 0) {
    return NextResponse.json({ message: "No events to analyze", count: 0 });
  }

  let analyzedCount = 0;
  const errors: { event: string; error: string }[] = [];

  for (const event of events) {
    try {
      const analysis = await analyzeEvent({
        eventName: event.eventName,
        dateTime: event.dateTime,
        period: event.period,
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
        category: event.category,
      });

      const data = {
        impactScore: analysis.impactScore,
        impactDirection: analysis.impactDirection,
        summary: analysis.summary,
        detailedAnalysis: analysis.detailedAnalysis,
        affectedSectors: analysis.affectedSectors,
        affectedAssets: analysis.affectedAssets,
        tradingImplications: analysis.tradingImplications,
        historicalContext: analysis.historicalContext,
        riskFactors: analysis.riskFactors,
        keyLevelsToWatch: analysis.keyLevelsToWatch,
      };

      if (event.analysis) {
        await prisma.eventAnalysis.update({
          where: { id: event.analysis.id },
          data: { ...data, webForecast: null, webSources: Prisma.JsonNull },
        });
      } else {
        await prisma.eventAnalysis.create({
          data: { eventId: event.id, ...data },
        });
      }
      analyzedCount++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to analyze event: ${event.eventName}`, errMsg);
      errors.push({ event: event.eventName, error: errMsg });
    }
  }

  return NextResponse.json({
    message: "Analysis completed",
    analyzed: analyzedCount,
    total: events.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}

async function handleWeeklyOutlook(force = false) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Check if outlook already exists for this week
  const existing = await prisma.weeklyOutlook.findUnique({
    where: { weekStart },
  });

  if (existing && !force) {
    return NextResponse.json({
      message: "Weekly outlook already exists",
      id: existing.id,
    });
  }

  // Delete existing if force regeneration
  if (existing && force) {
    await prisma.weeklyOutlook.delete({ where: { weekStart } });
  }

  // Get all events for this week with their analyses
  const events = await prisma.economicEvent.findMany({
    where: {
      dateTime: { gte: weekStart, lte: weekEnd },
    },
    include: { analysis: true },
    orderBy: { dateTime: "asc" },
  });

  if (events.length === 0) {
    return NextResponse.json({ message: "No events for this week" });
  }

  const outlook = await generateWeeklyOutlook(
    events.map((e) => ({
      eventName: e.eventName,
      dateTime: e.dateTime,
      actual: e.actual,
      forecast: e.forecast,
      previous: e.previous,
      category: e.category,
      importance: e.importance,
      analysis: e.analysis
        ? {
            impactScore: e.analysis.impactScore,
            impactDirection: e.analysis.impactDirection,
            summary: e.analysis.summary,
          }
        : null,
    })),
  );

  const saved = await prisma.weeklyOutlook.create({
    data: {
      weekStart,
      weekEnd,
      overallSentiment: outlook.overallSentiment,
      executiveSummary: outlook.executiveSummary,
      keyEvents: outlook.keyEvents,
      themeAnalysis: outlook.themeAnalysis,
      riskAssessment: outlook.riskAssessment,
      sectorRotation: outlook.sectorRotation,
    },
  });

  // Create notification for weekly outlook
  const sentimentLabel =
    outlook.overallSentiment === "BULLISH"
      ? "Bullish"
      : outlook.overallSentiment === "BEARISH"
        ? "Bearish"
        : "Neutral";
  await prisma.notification.create({
    data: {
      type: "OUTLOOK",
      title: `Weekly Outlook Ready: ${sentimentLabel}`,
      body: outlook.executiveSummary.slice(0, 150) + "...",
    },
  });

  return NextResponse.json({
    message: "Weekly outlook generated",
    id: saved.id,
  });
}

async function handleWebForecasts(force = false) {
  // Find HIGH importance events with analysis but no web forecast
  const events = await prisma.economicEvent.findMany({
    where: {
      importance: "HIGH",
      analysis: force ? { isNot: null } : { is: { webForecast: null } },
    },
    include: { analysis: true },
    orderBy: { dateTime: "asc" },
    take: 10,
  });

  if (events.length === 0) {
    return NextResponse.json({
      message: "No events need web forecasts",
      count: 0,
    });
  }

  let forecastCount = 0;
  const errors: { event: string; error: string }[] = [];

  for (const event of events) {
    try {
      const result = await generateWebForecast({
        eventName: event.eventName,
        dateTime: event.dateTime,
        period: event.period,
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
        category: event.category,
        importance: event.importance,
      });

      await prisma.eventAnalysis.update({
        where: { id: event.analysis!.id },
        data: {
          webForecast: result.forecast,
          webSources: result.sources,
        },
      });
      forecastCount++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to forecast: ${event.eventName}`, errMsg);
      errors.push({ event: event.eventName, error: errMsg });
    }
  }

  return NextResponse.json({
    message: "Web forecasts generated",
    forecasted: forecastCount,
    total: events.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
