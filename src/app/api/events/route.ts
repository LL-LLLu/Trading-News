import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  subMonths,
} from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const week = searchParams.get("week");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const month = searchParams.get("month");
  const mode = searchParams.get("mode"); // "all" to skip date filter
  const importance = searchParams.get("importance");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "200");
  const offset = parseInt(searchParams.get("offset") || "0");
  const includeAnalysis = searchParams.get("includeAnalysis") !== "false";

  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;

  if (mode === "all") {
    // No date filter - return all events
    dateFrom = undefined;
    dateTo = undefined;
  } else if (from && to) {
    dateFrom = parseISO(from);
    dateTo = parseISO(to);
  } else if (month) {
    const monthDate = parseISO(month);
    dateFrom = startOfMonth(monthDate);
    dateTo = endOfMonth(monthDate);
  } else if (week) {
    const weekDate = parseISO(week);
    dateFrom = startOfWeek(weekDate, { weekStartsOn: 1 });
    dateTo = endOfWeek(weekDate, { weekStartsOn: 1 });
  } else {
    const now = new Date();
    dateFrom = startOfWeek(now, { weekStartsOn: 1 });
    dateTo = endOfWeek(now, { weekStartsOn: 1 });
  }

  try {
    const where: Record<string, unknown> = {};

    if (dateFrom && dateTo) {
      where.dateTime = { gte: dateFrom, lte: dateTo };
    }
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
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: String(error) },
      { status: 500 },
    );
  }
}
