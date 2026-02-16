import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "date-fns";

export async function GET(request: NextRequest) {
  const weekParam = request.nextUrl.searchParams.get("week");
  const now = weekParam ? new Date(weekParam) : new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const cached = await prisma.weeklySentiment.findUnique({
    where: { weekStart },
  });

  if (!cached) {
    return Response.json(
      { error: "No sentiment analysis available yet for this week." },
      { status: 404 },
    );
  }

  return Response.json({
    sentiment: cached.sentiment,
    markdown: cached.markdown,
    weekStart: cached.weekStart,
    weekEnd: cached.weekEnd,
    updatedAt: cached.updatedAt,
  });
}
