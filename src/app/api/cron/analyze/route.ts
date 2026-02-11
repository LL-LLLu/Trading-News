import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeEvent, generateWeeklyOutlook } from "@/lib/gemini";
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

  try {
    if (mode === "weekly") {
      return await handleWeeklyOutlook();
    }
    return await handleEventAnalysis();
  } catch (error) {
    console.error("Analyze cron failed:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) },
      { status: 500 }
    );
  }
}

async function handleEventAnalysis() {
  // Find events without analysis
  const unanalyzed = await prisma.economicEvent.findMany({
    where: {
      analysis: null,
    },
    orderBy: { dateTime: "asc" },
    take: 20, // Process in batches to avoid timeout
  });

  if (unanalyzed.length === 0) {
    return NextResponse.json({ message: "No events to analyze", count: 0 });
  }

  let analyzedCount = 0;
  for (const event of unanalyzed) {
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

      await prisma.eventAnalysis.create({
        data: {
          eventId: event.id,
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
        },
      });
      analyzedCount++;
    } catch (err) {
      console.error(`Failed to analyze event: ${event.eventName}`, err);
    }
  }

  return NextResponse.json({
    message: "Analysis completed",
    analyzed: analyzedCount,
    total: unanalyzed.length,
  });
}

async function handleWeeklyOutlook() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Check if outlook already exists for this week
  const existing = await prisma.weeklyOutlook.findUnique({
    where: { weekStart },
  });

  if (existing) {
    return NextResponse.json({
      message: "Weekly outlook already exists",
      id: existing.id,
    });
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
    }))
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

  return NextResponse.json({
    message: "Weekly outlook generated",
    id: saved.id,
  });
}
