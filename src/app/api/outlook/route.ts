import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const weekParam = searchParams.get("week");

  const weekDate = weekParam ? parseISO(weekParam) : new Date();
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });

  try {
    const outlook = await prisma.weeklyOutlook.findUnique({
      where: { weekStart },
    });

    if (!outlook) {
      return NextResponse.json({ outlook: null });
    }

    return NextResponse.json({
      outlook: {
        ...outlook,
        weekStart: outlook.weekStart.toISOString(),
        weekEnd: outlook.weekEnd.toISOString(),
        createdAt: outlook.createdAt.toISOString(),
        updatedAt: outlook.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Outlook API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch outlook", details: String(error) },
      { status: 500 }
    );
  }
}
