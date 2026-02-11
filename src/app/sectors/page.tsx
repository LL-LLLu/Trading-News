import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { SectorsClient } from "./SectorsClient";

export const dynamic = "force-dynamic";

const GICS_SECTORS = [
  "Information Technology",
  "Health Care",
  "Financials",
  "Consumer Discretionary",
  "Communication Services",
  "Industrials",
  "Consumer Staples",
  "Energy",
  "Utilities",
  "Real Estate",
  "Materials",
];

export default async function SectorsPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const analyses = await prisma.eventAnalysis.findMany({
    where: {
      event: {
        dateTime: { gte: weekStart, lte: weekEnd },
      },
    },
    include: {
      event: {
        select: {
          eventName: true,
          dateTime: true,
          importance: true,
        },
      },
    },
  });

  // Aggregate sector impact scores
  const sectorData: Record<
    string,
    {
      totalScore: number;
      count: number;
      direction: { BULLISH: number; BEARISH: number; NEUTRAL: number };
      events: Array<{
        eventName: string;
        impactScore: number;
        impactDirection: string;
        summary: string;
      }>;
    }
  > = {};

  for (const sector of GICS_SECTORS) {
    sectorData[sector] = {
      totalScore: 0,
      count: 0,
      direction: { BULLISH: 0, BEARISH: 0, NEUTRAL: 0 },
      events: [],
    };
  }

  for (const analysis of analyses) {
    const affectedSectors = analysis.affectedSectors as string[];
    for (const sector of affectedSectors) {
      // Match to GICS sectors
      const matched = GICS_SECTORS.find(
        (s) =>
          s.toLowerCase().includes(sector.toLowerCase()) ||
          sector.toLowerCase().includes(s.toLowerCase())
      );
      if (matched && sectorData[matched]) {
        sectorData[matched].totalScore += analysis.impactScore;
        sectorData[matched].count++;
        sectorData[matched].direction[analysis.impactDirection]++;
        sectorData[matched].events.push({
          eventName: analysis.event.eventName,
          impactScore: analysis.impactScore,
          impactDirection: analysis.impactDirection,
          summary: analysis.summary,
        });
      }
    }
  }

  const serialized = Object.entries(sectorData).map(([sector, data]) => ({
    sector,
    avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    eventCount: data.count,
    netDirection:
      data.direction.BULLISH > data.direction.BEARISH
        ? ("BULLISH" as const)
        : data.direction.BEARISH > data.direction.BULLISH
          ? ("BEARISH" as const)
          : ("NEUTRAL" as const),
    events: data.events,
  }));

  return <SectorsClient sectors={serialized} />;
}

export const metadata = {
  title: "Sector Heatmap | Trading News",
  description: "GICS sector impact heatmap based on economic events",
};
