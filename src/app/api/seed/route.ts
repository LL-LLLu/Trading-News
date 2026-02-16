import { NextRequest, NextResponse } from "next/server";
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

// PATCH: Clear web forecasts so they can be regenerated with updated prompts
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.eventAnalysis.updateMany({
    where: { webForecast: { not: null } },
    data: { webForecast: null, webSources: undefined },
  });

  return NextResponse.json({
    message: "Web forecasts cleared for regeneration",
    cleared: result.count,
  });
}

// DELETE: Clean up seed data after a given date
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const after = request.nextUrl.searchParams.get("after");
  if (!after) {
    return NextResponse.json({ error: "Missing ?after= param" }, { status: 400 });
  }

  const afterDate = new Date(after);

  // Delete analyses first (cascade), then events
  const events = await prisma.economicEvent.findMany({
    where: {
      dateTime: { gte: afterDate },
      sourceUrl: { contains: "marketwatch" },
    },
    select: { id: true },
  });

  if (events.length === 0) {
    return NextResponse.json({ message: "No seed events to delete", count: 0 });
  }

  const ids = events.map((e) => e.id);

  // Delete related analyses first
  await prisma.eventAnalysis.deleteMany({
    where: { eventId: { in: ids } },
  });

  // Delete events
  const deleted = await prisma.economicEvent.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({
    message: "Seed data cleaned",
    deleted: deleted.count,
  });
}

// POST: Seed sample weekly outlook data
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const outlook = await prisma.weeklyOutlook.upsert({
      where: { weekStart },
      update: {
        overallSentiment: "BULLISH",
        executiveSummary: `This week's economic calendar is dominated by inflation data and labor market indicators that will shape Fed policy expectations heading into March. The January CPI report surprised to the upside at 0.5% MoM, reigniting concerns about sticky inflation. However, the labor market showed signs of cooling with ADP employment coming in well below expectations at 77K vs 140K forecast.\n\nMarkets are recalibrating rate cut expectations, now pricing in only two cuts for 2025 versus three previously. The combination of resilient economic growth (Q4 GDP at 2.3%) and persistent inflation creates a complex backdrop for risk assets. Watch for the PCE Price Index on Friday as the Fed's preferred inflation gauge.`,
        keyEvents: [
          { eventName: "Consumer Price Index (CPI) MoM", impactScore: 9, reasoning: "January CPI came in hot at 0.5% MoM vs 0.3% expected, the largest monthly increase since August 2023. Core CPI also exceeded expectations. This reading challenges the disinflation narrative and could delay Fed rate cuts." },
          { eventName: "Nonfarm Payrolls", impactScore: 9, reasoning: "The flagship employment report will reveal whether the labor market is truly cooling or if January's ADP miss was an outlier. Consensus expects 160K jobs added, but any significant beat could further reduce rate cut expectations." },
          { eventName: "FOMC Interest Rate Decision", impactScore: 8, reasoning: "The Fed held rates steady at 4.50% as expected, but the statement language shifted hawkish, removing references to 'progress on inflation.' Markets now see June as the earliest possible cut date." },
          { eventName: "Retail Sales MoM", impactScore: 7, reasoning: "January retail sales plunged -0.9%, the largest decline in nearly two years. This could signal consumer fatigue despite a strong labor market, with implications for Q1 GDP tracking." },
          { eventName: "PCE Price Index MoM", impactScore: 8, reasoning: "As the Fed's preferred inflation measure, January PCE will be scrutinized for confirmation of the CPI upside surprise. A hot reading could cement the 'higher for longer' narrative." },
          { eventName: "ISM Manufacturing PMI", impactScore: 6, reasoning: "Manufacturing returned to expansion territory at 50.9 in January, the first expansion in 26 months. Continued expansion would signal a broadening recovery beyond the services sector." },
        ],
        themeAnalysis: [
          { theme: "Inflation Resurgence", description: "January CPI surprised to the upside, challenging the smooth disinflation path markets had priced in. Shelter costs remain elevated and services inflation is sticky, keeping the Fed cautious about premature easing.", implications: "Rate cut timeline pushed back; bond yields likely to remain elevated; growth stocks face headwinds from higher discount rates." },
          { theme: "Consumer Spending Slowdown", description: "Retail sales dropped sharply in January while consumer confidence fell to its lowest level in 8 months. The savings rate buffer built during the pandemic continues to erode, especially for lower-income households.", implications: "Defensive consumer staples may outperform discretionary; retailers with pricing power favored; potential drag on Q1 GDP estimates." },
          { theme: "Manufacturing Renaissance", description: "ISM Manufacturing PMI crossed back above 50 for the first time since late 2022, driven by new orders and production gains. Reshoring trends and infrastructure spending are providing tailwinds.", implications: "Industrial and materials sectors benefit; capital goods companies see order growth; positive for cyclical rotation." },
          { theme: "Labor Market Rebalancing", description: "Mixed signals from the labor market — strong headline payrolls but cooling ADP numbers and rising initial claims suggest the rebalancing the Fed wants is underway, just unevenly.", implications: "Wage growth moderation supports margins; unemployment staying low supports consumer spending floor; gradual normalization is goldilocks scenario." },
        ],
        riskAssessment: [
          { risk: "Inflation Re-acceleration", probability: "HIGH" as const, impact: "If February CPI confirms January's hot reading, markets could reprice to zero cuts in 2025, triggering a significant equity selloff and USD strength." },
          { risk: "Tariff Escalation", probability: "HIGH" as const, impact: "New tariff announcements on Chinese goods could disrupt supply chains, add to inflationary pressures, and weigh on multinational earnings. Import prices already showing upward pressure." },
          { risk: "Credit Market Stress", probability: "MEDIUM" as const, impact: "Commercial real estate refinancing wave in Q1-Q2 could expose regional bank vulnerabilities. Spreads have widened modestly but remain below stress levels." },
          { risk: "Geopolitical Disruption", probability: "MEDIUM" as const, impact: "Ongoing Middle East tensions threaten oil supply routes. A sustained move above $85/bbl in WTI would add 20-30bps to headline inflation expectations." },
          { risk: "Consumer Credit Deterioration", probability: "LOW" as const, impact: "Credit card delinquencies rising to post-GFC highs among subprime borrowers. While contained for now, a labor market shock could trigger broader credit stress." },
        ],
        sectorRotation: [
          { sector: "Technology", outlook: "OVERWEIGHT" as const, reasoning: "AI infrastructure spending remains robust. Cloud hyperscaler capex guidance beat expectations. Valuations stretched but earnings delivery justifies premium." },
          { sector: "Energy", outlook: "OVERWEIGHT" as const, reasoning: "Geopolitical premium supports oil prices. Strong free cash flow generation and shareholder returns. Natural gas recovery from weather-driven demand." },
          { sector: "Healthcare", outlook: "OVERWEIGHT" as const, reasoning: "Defensive positioning attractive amid uncertainty. GLP-1 drug pipeline expanding. Managed care valuations attractive after recent pullback." },
          { sector: "Financials", outlook: "NEUTRAL" as const, reasoning: "Higher-for-longer rates support NIM but loan growth tepid. Investment banking recovery underway but CRE exposure a concern." },
          { sector: "Industrials", outlook: "NEUTRAL" as const, reasoning: "Infrastructure spending tailwind offset by tariff uncertainty. Order books solid but margin pressure from input costs." },
          { sector: "Consumer Staples", outlook: "NEUTRAL" as const, reasoning: "Volume growth challenging as consumers trade down. Pricing power waning. Dividend yields attractive but growth limited." },
          { sector: "Materials", outlook: "NEUTRAL" as const, reasoning: "China stimulus hopes support base metals. Gold benefiting from central bank buying. Chemical margins recovering from 2024 trough." },
          { sector: "Real Estate", outlook: "UNDERWEIGHT" as const, reasoning: "Higher rates pressure valuations and refinancing costs. Office vacancy remains elevated. Residential REITs better positioned than commercial." },
          { sector: "Utilities", outlook: "UNDERWEIGHT" as const, reasoning: "Rate-sensitive sector faces headwinds from higher Treasury yields. AI data center power demand is a long-term positive but near-term drag from rising capital costs." },
          { sector: "Consumer Discretionary", outlook: "UNDERWEIGHT" as const, reasoning: "Retail sales decline signals consumer fatigue. Auto sales slowing. Student loan repayments and higher credit costs weighing on spending power." },
        ],
      },
      create: {
        weekStart,
        weekEnd,
        overallSentiment: "BULLISH",
        executiveSummary: `This week's economic calendar is dominated by inflation data and labor market indicators that will shape Fed policy expectations heading into March. The January CPI report surprised to the upside at 0.5% MoM, reigniting concerns about sticky inflation. However, the labor market showed signs of cooling with ADP employment coming in well below expectations at 77K vs 140K forecast.\n\nMarkets are recalibrating rate cut expectations, now pricing in only two cuts for 2025 versus three previously. The combination of resilient economic growth (Q4 GDP at 2.3%) and persistent inflation creates a complex backdrop for risk assets. Watch for the PCE Price Index on Friday as the Fed's preferred inflation gauge.`,
        keyEvents: [
          { eventName: "Consumer Price Index (CPI) MoM", impactScore: 9, reasoning: "January CPI came in hot at 0.5% MoM vs 0.3% expected, the largest monthly increase since August 2023. Core CPI also exceeded expectations. This reading challenges the disinflation narrative and could delay Fed rate cuts." },
          { eventName: "Nonfarm Payrolls", impactScore: 9, reasoning: "The flagship employment report will reveal whether the labor market is truly cooling or if January's ADP miss was an outlier. Consensus expects 160K jobs added, but any significant beat could further reduce rate cut expectations." },
          { eventName: "FOMC Interest Rate Decision", impactScore: 8, reasoning: "The Fed held rates steady at 4.50% as expected, but the statement language shifted hawkish, removing references to 'progress on inflation.' Markets now see June as the earliest possible cut date." },
          { eventName: "Retail Sales MoM", impactScore: 7, reasoning: "January retail sales plunged -0.9%, the largest decline in nearly two years. This could signal consumer fatigue despite a strong labor market, with implications for Q1 GDP tracking." },
          { eventName: "PCE Price Index MoM", impactScore: 8, reasoning: "As the Fed's preferred inflation measure, January PCE will be scrutinized for confirmation of the CPI upside surprise. A hot reading could cement the 'higher for longer' narrative." },
          { eventName: "ISM Manufacturing PMI", impactScore: 6, reasoning: "Manufacturing returned to expansion territory at 50.9 in January, the first expansion in 26 months. Continued expansion would signal a broadening recovery beyond the services sector." },
        ],
        themeAnalysis: [
          { theme: "Inflation Resurgence", description: "January CPI surprised to the upside, challenging the smooth disinflation path markets had priced in. Shelter costs remain elevated and services inflation is sticky, keeping the Fed cautious about premature easing.", implications: "Rate cut timeline pushed back; bond yields likely to remain elevated; growth stocks face headwinds from higher discount rates." },
          { theme: "Consumer Spending Slowdown", description: "Retail sales dropped sharply in January while consumer confidence fell to its lowest level in 8 months. The savings rate buffer built during the pandemic continues to erode, especially for lower-income households.", implications: "Defensive consumer staples may outperform discretionary; retailers with pricing power favored; potential drag on Q1 GDP estimates." },
          { theme: "Manufacturing Renaissance", description: "ISM Manufacturing PMI crossed back above 50 for the first time since late 2022, driven by new orders and production gains. Reshoring trends and infrastructure spending are providing tailwinds.", implications: "Industrial and materials sectors benefit; capital goods companies see order growth; positive for cyclical rotation." },
          { theme: "Labor Market Rebalancing", description: "Mixed signals from the labor market — strong headline payrolls but cooling ADP numbers and rising initial claims suggest the rebalancing the Fed wants is underway, just unevenly.", implications: "Wage growth moderation supports margins; unemployment staying low supports consumer spending floor; gradual normalization is goldilocks scenario." },
        ],
        riskAssessment: [
          { risk: "Inflation Re-acceleration", probability: "HIGH" as const, impact: "If February CPI confirms January's hot reading, markets could reprice to zero cuts in 2025, triggering a significant equity selloff and USD strength." },
          { risk: "Tariff Escalation", probability: "HIGH" as const, impact: "New tariff announcements on Chinese goods could disrupt supply chains, add to inflationary pressures, and weigh on multinational earnings. Import prices already showing upward pressure." },
          { risk: "Credit Market Stress", probability: "MEDIUM" as const, impact: "Commercial real estate refinancing wave in Q1-Q2 could expose regional bank vulnerabilities. Spreads have widened modestly but remain below stress levels." },
          { risk: "Geopolitical Disruption", probability: "MEDIUM" as const, impact: "Ongoing Middle East tensions threaten oil supply routes. A sustained move above $85/bbl in WTI would add 20-30bps to headline inflation expectations." },
          { risk: "Consumer Credit Deterioration", probability: "LOW" as const, impact: "Credit card delinquencies rising to post-GFC highs among subprime borrowers. While contained for now, a labor market shock could trigger broader credit stress." },
        ],
        sectorRotation: [
          { sector: "Technology", outlook: "OVERWEIGHT" as const, reasoning: "AI infrastructure spending remains robust. Cloud hyperscaler capex guidance beat expectations. Valuations stretched but earnings delivery justifies premium." },
          { sector: "Energy", outlook: "OVERWEIGHT" as const, reasoning: "Geopolitical premium supports oil prices. Strong free cash flow generation and shareholder returns. Natural gas recovery from weather-driven demand." },
          { sector: "Healthcare", outlook: "OVERWEIGHT" as const, reasoning: "Defensive positioning attractive amid uncertainty. GLP-1 drug pipeline expanding. Managed care valuations attractive after recent pullback." },
          { sector: "Financials", outlook: "NEUTRAL" as const, reasoning: "Higher-for-longer rates support NIM but loan growth tepid. Investment banking recovery underway but CRE exposure a concern." },
          { sector: "Industrials", outlook: "NEUTRAL" as const, reasoning: "Infrastructure spending tailwind offset by tariff uncertainty. Order books solid but margin pressure from input costs." },
          { sector: "Consumer Staples", outlook: "NEUTRAL" as const, reasoning: "Volume growth challenging as consumers trade down. Pricing power waning. Dividend yields attractive but growth limited." },
          { sector: "Materials", outlook: "NEUTRAL" as const, reasoning: "China stimulus hopes support base metals. Gold benefiting from central bank buying. Chemical margins recovering from 2024 trough." },
          { sector: "Real Estate", outlook: "UNDERWEIGHT" as const, reasoning: "Higher rates pressure valuations and refinancing costs. Office vacancy remains elevated. Residential REITs better positioned than commercial." },
          { sector: "Utilities", outlook: "UNDERWEIGHT" as const, reasoning: "Rate-sensitive sector faces headwinds from higher Treasury yields. AI data center power demand is a long-term positive but near-term drag from rising capital costs." },
          { sector: "Consumer Discretionary", outlook: "UNDERWEIGHT" as const, reasoning: "Retail sales decline signals consumer fatigue. Auto sales slowing. Student loan repayments and higher credit costs weighing on spending power." },
        ],
      },
    });

    return NextResponse.json({
      message: "Weekly outlook seeded",
      id: outlook.id,
      weekStart: outlook.weekStart.toISOString(),
      weekEnd: outlook.weekEnd.toISOString(),
    });
  } catch (error) {
    console.error("Outlook seed failed:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
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
