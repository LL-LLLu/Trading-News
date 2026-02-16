import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeEconomicCalendar } from "@/lib/scraper";

export const maxDuration = 60;

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
    const events = await scrapeEconomicCalendar();

    if (events.length === 0) {
      return NextResponse.json({
        message: "No events scraped",
        count: 0,
      });
    }

    let upsertedCount = 0;
    let surpriseCount = 0;
    for (const event of events) {
      try {
        // Check if this event previously had no actual data (for surprise detection)
        const existing = await prisma.economicEvent.findUnique({
          where: {
            eventSlug_dateTime: {
              eventSlug: event.eventSlug,
              dateTime: event.dateTime,
            },
          },
          select: { id: true, actual: true, forecast: true, importance: true },
        });

        const isNewRelease =
          existing &&
          !existing.actual &&
          event.actual != null &&
          event.actual !== "";

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

        // Surprise detection: actual just populated and deviates from forecast
        if (isNewRelease && existing.forecast) {
          const actual = parseFloat(event.actual!.replace(/[%,K]/g, ""));
          const forecast = parseFloat(existing.forecast.replace(/[%,K]/g, ""));
          if (!isNaN(actual) && !isNaN(forecast) && forecast !== 0) {
            const surprisePct = Math.abs(
              ((actual - forecast) / Math.abs(forecast)) * 100,
            );
            // Threshold: >5% deviation for HIGH, >10% for others
            const threshold = existing.importance === "HIGH" ? 5 : 10;
            if (surprisePct >= threshold) {
              const direction = actual > forecast ? "above" : "below";
              await prisma.notification.create({
                data: {
                  type: "SURPRISE",
                  title: `${event.eventName}: ${direction === "above" ? "Beat" : "Miss"}`,
                  body: `Actual ${event.actual} vs Forecast ${existing.forecast} (${surprisePct.toFixed(1)}% ${direction})`,
                  eventId: existing.id,
                  metadata: {
                    actual: event.actual,
                    forecast: existing.forecast,
                    surprisePct,
                    direction,
                  },
                },
              });
              surpriseCount++;
            }
          }
        }
      } catch (err) {
        console.error(`Failed to upsert event: ${event.eventName}`, err);
      }
    }

    return NextResponse.json({
      message: "Scrape completed",
      scraped: events.length,
      upserted: upsertedCount,
      surprises: surpriseCount,
    });
  } catch (error) {
    console.error("Scrape cron failed:", error);
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 },
    );
  }
}
