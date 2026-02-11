import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeMarketWatch } from "@/lib/scraper";

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await scrapeMarketWatch();

    if (events.length === 0) {
      return NextResponse.json({
        message: "No events scraped",
        count: 0,
      });
    }

    let upsertedCount = 0;
    for (const event of events) {
      try {
        await prisma.economicEvent.upsert({
          where: {
            eventSlug_dateTime: {
              eventSlug: event.eventSlug,
              dateTime: event.dateTime,
            },
          },
          update: {
            actual: event.actual,
            forecast: event.forecast,
            previous: event.previous,
            importance: event.importance,
          },
          create: {
            eventName: event.eventName,
            eventSlug: event.eventSlug,
            dateTime: event.dateTime,
            period: event.period,
            actual: event.actual,
            forecast: event.forecast,
            previous: event.previous,
            unit: event.unit,
            importance: event.importance,
            category: event.category,
            sourceUrl: event.sourceUrl,
          },
        });
        upsertedCount++;
      } catch (err) {
        console.error(`Failed to upsert event: ${event.eventName}`, err);
      }
    }

    return NextResponse.json({
      message: "Scrape completed",
      scraped: events.length,
      upserted: upsertedCount,
    });
  } catch (error) {
    console.error("Scrape cron failed:", error);
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}
