import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  startOfWeek,
  endOfWeek,
  addDays,
  addHours,
  setHours,
  setMinutes,
  subWeeks,
} from "date-fns";

export const maxDuration = 60;

const SEED_EVENTS = [
  // HIGH IMPACT
  {
    eventName: "Nonfarm Payrolls",
    category: "EMPLOYMENT" as const,
    importance: "HIGH" as const,
    dayOfWeek: 5,
    hour: 8,
    minute: 30,
    values: [
      { actual: "256K", forecast: "160K", previous: "212K", period: "Dec" },
      { actual: "143K", forecast: "170K", previous: "256K", period: "Jan" },
      { actual: "151K", forecast: "160K", previous: "125K", period: "Feb" },
    ],
  },
  {
    eventName: "Unemployment Rate",
    category: "EMPLOYMENT" as const,
    importance: "HIGH" as const,
    dayOfWeek: 5,
    hour: 8,
    minute: 30,
    values: [
      { actual: "4.1%", forecast: "4.2%", previous: "4.2%", period: "Dec" },
      { actual: "4.0%", forecast: "4.1%", previous: "4.1%", period: "Jan" },
      { actual: "4.1%", forecast: "4.0%", previous: "4.0%", period: "Feb" },
    ],
  },
  {
    eventName: "Consumer Price Index (CPI) MoM",
    category: "INFLATION" as const,
    importance: "HIGH" as const,
    dayOfWeek: 3,
    hour: 8,
    minute: 30,
    values: [
      { actual: "0.4%", forecast: "0.3%", previous: "0.3%", period: "Dec" },
      { actual: "0.5%", forecast: "0.3%", previous: "0.4%", period: "Jan" },
      { actual: "0.2%", forecast: "0.3%", previous: "0.5%", period: "Feb" },
    ],
  },
  {
    eventName: "CPI YoY",
    category: "INFLATION" as const,
    importance: "HIGH" as const,
    dayOfWeek: 3,
    hour: 8,
    minute: 30,
    values: [
      { actual: "2.9%", forecast: "2.9%", previous: "2.7%", period: "Dec" },
      { actual: "3.0%", forecast: "2.9%", previous: "2.9%", period: "Jan" },
      { actual: "2.8%", forecast: "2.9%", previous: "3.0%", period: "Feb" },
    ],
  },
  {
    eventName: "GDP Growth Rate QoQ",
    category: "GDP" as const,
    importance: "HIGH" as const,
    dayOfWeek: 4,
    hour: 8,
    minute: 30,
    values: [
      { actual: "3.1%", forecast: "2.8%", previous: "3.0%", period: "Q3" },
      { actual: "2.3%", forecast: "2.6%", previous: "3.1%", period: "Q4" },
    ],
  },
  {
    eventName: "FOMC Interest Rate Decision",
    category: "MONETARY_POLICY" as const,
    importance: "HIGH" as const,
    dayOfWeek: 3,
    hour: 14,
    minute: 0,
    values: [
      { actual: "4.50%", forecast: "4.50%", previous: "4.75%", period: "Jan" },
      { actual: "4.50%", forecast: "4.50%", previous: "4.50%", period: "Mar" },
    ],
  },
  {
    eventName: "Retail Sales MoM",
    category: "CONSUMER" as const,
    importance: "HIGH" as const,
    dayOfWeek: 2,
    hour: 8,
    minute: 30,
    values: [
      { actual: "0.4%", forecast: "0.6%", previous: "0.8%", period: "Dec" },
      { actual: "-0.9%", forecast: "-0.2%", previous: "0.4%", period: "Jan" },
      { actual: "0.2%", forecast: "0.6%", previous: "-0.9%", period: "Feb" },
    ],
  },
  {
    eventName: "ISM Manufacturing PMI",
    category: "MANUFACTURING" as const,
    importance: "HIGH" as const,
    dayOfWeek: 1,
    hour: 10,
    minute: 0,
    values: [
      { actual: "49.3", forecast: "48.4", previous: "48.4", period: "Dec" },
      { actual: "50.9", forecast: "49.8", previous: "49.3", period: "Jan" },
      { actual: "50.3", forecast: "50.5", previous: "50.9", period: "Feb" },
    ],
  },
  {
    eventName: "PCE Price Index MoM",
    category: "INFLATION" as const,
    importance: "HIGH" as const,
    dayOfWeek: 5,
    hour: 8,
    minute: 30,
    values: [
      { actual: "0.3%", forecast: "0.3%", previous: "0.1%", period: "Dec" },
      { actual: "0.3%", forecast: "0.3%", previous: "0.3%", period: "Jan" },
    ],
  },
  // MEDIUM IMPACT
  {
    eventName: "Initial Jobless Claims",
    category: "EMPLOYMENT" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 4,
    hour: 8,
    minute: 30,
    values: [
      { actual: "219K", forecast: "214K", previous: "220K", period: "Feb 1" },
      { actual: "213K", forecast: "215K", previous: "219K", period: "Feb 8" },
    ],
  },
  {
    eventName: "ADP Employment Change",
    category: "EMPLOYMENT" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 3,
    hour: 8,
    minute: 15,
    values: [
      { actual: "183K", forecast: "150K", previous: "176K", period: "Jan" },
      { actual: "77K", forecast: "140K", previous: "186K", period: "Feb" },
    ],
  },
  {
    eventName: "Consumer Confidence Index",
    category: "CONSUMER" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 2,
    hour: 10,
    minute: 0,
    values: [
      { actual: "104.1", forecast: "106.0", previous: "109.5", period: "Jan" },
      { actual: "98.3", forecast: "102.5", previous: "104.1", period: "Feb" },
    ],
  },
  {
    eventName: "Existing Home Sales",
    category: "HOUSING" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 4,
    hour: 10,
    minute: 0,
    values: [
      { actual: "4.24M", forecast: "4.19M", previous: "4.15M", period: "Dec" },
      { actual: "4.08M", forecast: "4.13M", previous: "4.24M", period: "Jan" },
    ],
  },
  {
    eventName: "Durable Goods Orders MoM",
    category: "MANUFACTURING" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 3,
    hour: 8,
    minute: 30,
    values: [
      { actual: "-2.2%", forecast: "0.5%", previous: "-2.0%", period: "Dec" },
      { actual: "3.1%", forecast: "2.0%", previous: "-2.2%", period: "Jan" },
    ],
  },
  {
    eventName: "Michigan Consumer Sentiment",
    category: "CONSUMER" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 5,
    hour: 10,
    minute: 0,
    values: [
      { actual: "71.1", forecast: "73.2", previous: "74.0", period: "Jan" },
      { actual: "64.7", forecast: "67.8", previous: "71.1", period: "Feb" },
    ],
  },
  {
    eventName: "Housing Starts",
    category: "HOUSING" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 3,
    hour: 8,
    minute: 30,
    values: [
      { actual: "1.499M", forecast: "1.330M", previous: "1.294M", period: "Dec" },
      { actual: "1.366M", forecast: "1.390M", previous: "1.499M", period: "Jan" },
    ],
  },
  {
    eventName: "Trade Balance",
    category: "TRADE" as const,
    importance: "MEDIUM" as const,
    dayOfWeek: 4,
    hour: 8,
    minute: 30,
    values: [
      { actual: "-$98.4B", forecast: "-$96.5B", previous: "-$78.9B", period: "Dec" },
      { actual: "-$131.4B", forecast: "-$127.4B", previous: "-$98.4B", period: "Jan" },
    ],
  },
  // LOW IMPACT
  {
    eventName: "Wholesale Inventories MoM",
    category: "TRADE" as const,
    importance: "LOW" as const,
    dayOfWeek: 2,
    hour: 10,
    minute: 0,
    values: [
      { actual: "0.0%", forecast: "0.1%", previous: "0.2%", period: "Dec" },
    ],
  },
  {
    eventName: "Baker Hughes Oil Rig Count",
    category: "ENERGY" as const,
    importance: "LOW" as const,
    dayOfWeek: 5,
    hour: 13,
    minute: 0,
    values: [
      { actual: "480", forecast: null, previous: "479", period: "Feb 7" },
    ],
  },
  {
    eventName: "Federal Budget Balance",
    category: "GOVERNMENT" as const,
    importance: "LOW" as const,
    dayOfWeek: 3,
    hour: 14,
    minute: 0,
    values: [
      { actual: "-$129B", forecast: "-$87B", previous: "-$87B", period: "Jan" },
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    let created = 0;
    const now = new Date();

    for (const event of SEED_EVENTS) {
      for (let weekOffset = -4; weekOffset <= 1; weekOffset++) {
        const week = weekOffset === 0 ? now : addDays(now, weekOffset * 7);
        const weekStart = startOfWeek(week, { weekStartsOn: 1 });

        const valueIndex = Math.min(
          Math.max(0, weekOffset + event.values.length - 1),
          event.values.length - 1
        );
        const value = event.values[valueIndex];
        if (!value) continue;

        let eventDate = addDays(weekStart, event.dayOfWeek - 1);
        eventDate = setHours(eventDate, event.hour);
        eventDate = setMinutes(eventDate, event.minute);

        const slug = slugify(event.eventName);

        try {
          await prisma.economicEvent.upsert({
            where: {
              eventSlug_dateTime: {
                eventSlug: slug,
                dateTime: eventDate,
              },
            },
            update: {
              actual: value.actual || undefined,
              forecast: value.forecast || undefined,
              previous: value.previous || undefined,
            },
            create: {
              eventName: event.eventName,
              eventSlug: slug,
              dateTime: eventDate,
              period: value.period,
              actual: value.actual || undefined,
              forecast: value.forecast || undefined,
              previous: value.previous || undefined,
              importance: event.importance,
              category: event.category,
              sourceUrl: "https://www.marketwatch.com/economy-politics/calendar",
            },
          });
          created++;
        } catch (err) {
          console.error(`Failed to seed: ${event.eventName}`, err);
        }
      }
    }

    return NextResponse.json({
      message: "Seed completed",
      eventsCreated: created,
    });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
