import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const week = searchParams.get("week"); // ISO date string for week
  const importance = searchParams.get("importance");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const includeAnalysis = searchParams.get("includeAnalysis") !== "false";

  // Build date range
  let dateFrom: Date;
  let dateTo: Date;

  if (week) {
    const weekDate = parseISO(week);
    dateFrom = startOfWeek(weekDate, { weekStartsOn: 1 });
    dateTo = endOfWeek(weekDate, { weekStartsOn: 1 });
  } else {
    // Default to current week
    const now = new Date();
    dateFrom = startOfWeek(now, { weekStartsOn: 1 });
    dateTo = endOfWeek(now, { weekStartsOn: 1 });
  }

  try {
    const where: Record<string, unknown> = {
      dateTime: { gte: dateFrom, lte: dateTo },
    };

    if (importance) {
      where.importance = importance;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.eventName = { contains: search, mode: "insensitive" };
    }

    const [events, total] = await Promise.all([
      prisma.economicEvent.findMany({
        where,
        include: includeAnalysis ? { analysis: true } : undefined,
        orderBy: { dateTime: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.economicEvent.count({ where }),
    ]);

    return NextResponse.json({
      events,
      total,
      weekStart: dateFrom.toISOString(),
      weekEnd: dateTo.toISOString(),
    });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
